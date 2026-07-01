import CFG from "@/src/constants/Config";
import axios from "axios";

export async function resetWifiTransferServer(ip: string): Promise<boolean> {
  try {
    await axios.get(`http://${ip}${CFG.PORT}/reset`);
    return true;
  } catch {
    return false;
  }
}
