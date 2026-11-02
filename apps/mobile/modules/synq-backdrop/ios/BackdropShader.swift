import Metal
import simd

/// The field behind the player. Each swatch is a soft pool of color drifting
/// slowly around its anchor; every pixel is a normalized blend of the pools,
/// so the backdrop is never brighter than its brightest swatch. That's what
/// keeps white text readable. Sampling the blend through a slowly warping
/// domain makes the pools' edges flow instead of sliding like circles.
enum BackdropShader {
  static let maxSwatches = 6

  /// Matches `Uniforms` below, one `SIMD4` for each `float4`.
  struct Uniforms {
    var time: Float = 0
    var aspect: Float = 1
    var count: UInt32 = 0
    var padding: Float = 0
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
        total += weight;
      }
      float3 color = sum / max(total, 1e-5);

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
