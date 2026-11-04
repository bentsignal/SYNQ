import Metal
import simd

/// The field behind the player. Each swatch is a soft pool of color drifting
/// slowly around its anchor; every pixel is a normalized blend of the pools,
/// so the backdrop is never lighter than its lightest swatch. That's what
/// keeps white text readable. They mix in Oklab, where a mix keeps its lightness. Sampling the blend through a slowly warping
/// domain makes the pools' edges flow instead of sliding like circles.
enum BackdropShader {
  static let maxSwatches = 6

  /// sRGB as Oklab L, a, b, with its chroma where the alpha was, as `colors` in
  /// `Uniforms` takes it.
  static func oklab(_ color: SIMD4<Float>) -> SIMD4<Float> {
    func linear(_ c: Float) -> Float {
      c <= 0.040_45 ? c / 12.92 : powf((c + 0.055) / 1.055, 2.4)
    }
    let r = linear(color.x)
    let g = linear(color.y)
    let b = linear(color.z)
    let l = cbrtf(0.412_221_47 * r + 0.536_332_54 * g + 0.051_445_99 * b)
    let m = cbrtf(0.211_903_50 * r + 0.680_699_55 * g + 0.107_396_96 * b)
    let s = cbrtf(0.088_302_46 * r + 0.281_718_84 * g + 0.629_978_70 * b)
    let labA = 1.977_998_50 * l - 2.428_592_21 * m + 0.450_593_71 * s
    let labB = 0.025_904_04 * l + 0.782_771_77 * m - 0.808_675_77 * s
    return SIMD4(
      0.210_454_26 * l + 0.793_617_79 * m - 0.004_072_05 * s, labA, labB,
      (labA * labA + labB * labB).squareRoot())
  }

  /// Matches `Uniforms` below, one `SIMD4` for each `float4`.
  struct Uniforms {
    var time: Float = 0
    var aspect: Float = 1
    var count: UInt32 = 0
    var padding: Float = 0
    /// Oklab, from `oklab(_:)`.
    var colors = [SIMD4<Float>](repeating: .zero, count: maxSwatches)
    /// Anchor x and y, and the pool's strength.
    var pools = [SIMD4<Float>](repeating: .zero, count: maxSwatches)

    var bytes: [SIMD4<Float>] {
      // The header is 16 bytes, the size of one element.
      let header = SIMD4<Float>(
        time, aspect, Float(bitPattern: count), padding)
      return [header] + colors + pools
    }
  }

  static let source = """
    #include <metal_stdlib>
    using namespace metal;

    struct Uniforms {
      float time;
      float aspect;
      uint count;
      float padding;
      float4 colors[\(maxSwatches)];
      float4 pools[\(maxSwatches)];
    };

    struct Varying {
      float4 position [[position]];
      float2 uv;
    };

    vertex Varying backdropVertex(uint vertexId [[vertex_id]]) {
      float2 corner = float2((vertexId << 1) & 2, vertexId & 2);
      Varying out;
      out.position = float4(corner * float2(2, -2) + float2(-1, 1), 0, 1);
      out.uv = corner;
      return out;
    }

    float3 oklabToSrgb(float3 lab) {
      float l = lab.x + 0.39633778 * lab.y + 0.21580376 * lab.z;
      float m = lab.x - 0.10556135 * lab.y - 0.06385417 * lab.z;
      float s = lab.x - 0.08948418 * lab.y - 1.29148555 * lab.z;
      l = l * l * l;
      m = m * m * m;
      s = s * s * s;
      float3 c = clamp(float3(
        4.07674166 * l - 3.30771159 * m + 0.23096993 * s,
        -1.268438 * l + 2.6097574 * m - 0.3413194 * s,
        -0.00419609 * l - 0.70341861 * m + 1.7076147 * s), 0.0, 1.0);
      return select(
        1.055 * pow(c, float3(1.0 / 2.4)) - 0.055, c * 12.92, c <= 0.0031308);
    }

    fragment float4 backdropFragment(
      Varying in [[stage_in]], constant Uniforms &u [[buffer(0)]]
    ) {
      float t = u.time;
      float2 scale = float2(u.aspect, 1);
      float2 p = in.uv * scale;

      // Two octaves of sine warp: cheap, smooth, and it never repeats by eye.
      float2 q = p + 0.11 * float2(
        sin(p.y * 2.3 + t * 0.19), cos(p.x * 3.1 - t * 0.16));
      q += 0.05 * float2(
        sin(q.y * 4.7 - t * 0.13 + 1.3), cos(q.x * 5.3 + t * 0.11 + 0.7));

      float3 sum = float3(0);
      float chroma = 0;
      float total = 0;
      for (uint i = 0; i < u.count; i++) {
        // Golden-angle phases, so no two pools move together.
        float phase = float(i) * 2.399;
        float2 drift = float2(
          sin(t * (0.083 + 0.011 * float(i)) + phase),
          cos(t * (0.071 + 0.013 * float(i)) + phase * 1.7));
        float2 d = q - (u.pools[i].xy + 0.14 * drift) * scale;
        // Softer than a Gaussian: pools fade into each other with no edges.
        float falloff = dot(d, d) + 0.03;
        float weight = u.pools[i].z / (falloff * sqrt(falloff));
        sum += u.colors[i].rgb * weight;
        chroma += u.colors[i].a * weight;
        total += weight;
      }
      float3 lab = sum / max(total, 1e-5);

      // Hues cancel in a mix, which is what turns neighbors grey; most of the
      // chroma they lost goes back.
      float mixed = length(lab.yz);
      float lost = mixed > 1e-4 ? min(chroma / max(total, 1e-5) / mixed, 3.0) : 1.0;
      lab.yz *= mix(1.0, lost, 0.6);
      float3 color = oklabToSrgb(lab);

      // A little darker behind the controls.
      color *= mix(1.0, 0.8, smoothstep(0.45, 1.0, in.uv.y));

      // Dark gradients band on an 8-bit screen; a pixel's worth of noise hides it.
      float noise = fract(
        52.9829189 * fract(dot(in.position.xy, float2(0.06711056, 0.00583715))));
      return float4(color + (noise - 0.5) / 255.0, 1);
    }
    """

  /// The compiled pipeline, built off the main thread on first use, since
  /// Metal compiles the source at run time.
  static func makePipeline(device: MTLDevice, format: MTLPixelFormat) throws
    -> MTLRenderPipelineState
  {
    let library = try device.makeLibrary(source: source, options: nil)
    let descriptor = MTLRenderPipelineDescriptor()
    descriptor.vertexFunction = library.makeFunction(name: "backdropVertex")
    descriptor.fragmentFunction = library.makeFunction(name: "backdropFragment")
    descriptor.colorAttachments[0].pixelFormat = format
    return try device.makeRenderPipelineState(descriptor: descriptor)
  }

  /// Encodes one frame into a pass that targets the whole drawable.
  static func encode(
    _ uniforms: Uniforms, pipeline: MTLRenderPipelineState, into encoder: MTLRenderCommandEncoder
  ) {
    encoder.setRenderPipelineState(pipeline)
    var bytes = uniforms.bytes
    encoder.setFragmentBytes(
      &bytes, length: bytes.count * MemoryLayout<SIMD4<Float>>.stride, index: 0)
    encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 3)
    encoder.endEncoding()
  }
}
