import CFG from "@/src/constants/Config";
import axios from "axios";

export async function resetWifiTransferServer(ip: string) {
  try {
    await axios.get(`http://${ip}${CFG.PORT}/reset`);
  } catch (error) {
    console.log("error resetting results: ", error);
  }
}
