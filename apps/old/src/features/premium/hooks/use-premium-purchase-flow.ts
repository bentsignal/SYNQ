import { useCallback, useEffect, useState } from "react";
import { NotificationType } from "@/src/constants/Types";
import { useHaptics } from "@/src/features/haptics/hooks/use-haptics";
import { useNotificationsContext } from "@/src/features/notifications/context/NotificationsProvider";
import { usePremiumContext } from "@/src/features/premium/context/PremiumProvider";
import * as PurchaseManager from "@/src/features/premium/lib/purchase-service";
import { posthog } from "@/src/lib/posthog";
import { Alert } from "react-native";

type PremiumStatus = Awaited<ReturnType<typeof PurchaseManager.checkStatus>>;
type PremiumPrices = Awaited<ReturnType<typeof PurchaseManager.getPrices>>;

const productNames = [
  "Premium Monthly",
  "Premium Yearly",
  "Premium Lifetime",
] as const;

const getProductName = (selected: number) => {
  const productName = productNames[selected];
  if (!productName) {
    throw new Error("Invalid purchase option");
  }

  return productName;
};

const getRestoreMessage = (name: string) => {
  if (name === "SYNQPremiumMonthly") {
    return "Successfully restored your monthly subscription.";
  }
  if (name === "SYNQPremiumYearly") {
    return "Successfully restored your yearly subscription.";
  }
  if (name === "SYNQPremiumLifetime") {
    return "Successfully restored your lifetime subscription.";
  }

  return "Successfully restored your purchase.";
};

const getSelectedTierFromProduct = (name: string) => {
  if (name === "SYNQPremiumMonthly") {
    return 0;
  }
  if (name === "SYNQPremiumYearly") {
    return 1;
  }
  if (name === "SYNQPremiumLifetime") {
    return 2;
  }

  return undefined;
};

export function usePremiumPurchaseFlow() {
  const { addNotification } = useNotificationsContext();
  const { sendHaptic } = useHaptics();
  const { setPremium } = usePremiumContext();

  const [selected, setSelected] = useState(0);
  const [renew, setRenew] = useState(true);
  const [loading, setLoading] = useState(true);
  const [end, setEnd] = useState("January 1, 2000");
  const [active, setActive] = useState(false);
  const [purchaseText, setPurchaseText] = useState("Purchase");
  const [monthlyText, setMonthlyText] = useState("Purchase");
  const [yearlyText, setYearlyText] = useState("Purchase");
  const [monthlyCost, setMonthlyCost] = useState("$∞");
  const [yearlyCost, setYearlyCost] = useState("$∞");
  const [lifetimeCost, setLifetimeCost] = useState("$∞");
  const [error, setError] = useState(false);

  const sendErrorNotification = useCallback(
    (title: string, message: string, brief: string, trace: string) => {
      addNotification(
        NotificationType.ERROR,
        title,
        brief,
        message,
        trace,
        () => {},
      );
    },
    [addNotification],
  );

  const setPrices = useCallback((prices: PremiumPrices) => {
    setLifetimeCost(prices.lifetime);
    setMonthlyCost(prices.monthly);
    setYearlyCost(prices.yearly);
  }, []);

  const updateStatus = useCallback(
    ({ id, renewal, end, trialAvailable }: PremiumStatus) => {
      if (id === "") {
        setActive(false);
        setSelected(1);
        if (trialAvailable) {
          setMonthlyText("Start 1 month free trial");
          setYearlyText("Start 3 month free trial");
          setPurchaseText("Start 3 month free trial");
        }
        return;
      }

      setActive(true);
      setPremium(true);
      setRenew(renewal);
      setEnd(end);

      const selectedTier = getSelectedTierFromProduct(id);
      if (selectedTier !== undefined) {
        setSelected(selectedTier);
      }
    },
    [setPremium],
  );

  useEffect(() => {
    const run = async () => {
      try {
        await PurchaseManager.connect();
        setPrices(await PurchaseManager.getPrices());
        updateStatus(await PurchaseManager.checkStatus());
        setLoading(false);
      } catch (error) {
        const trace = error instanceof Error ? error.message : String(error);
        sendErrorNotification(
          "Premium Error",
          "We ran into an issue trying to load premium options, please try again later",
          "Unable to load options",
          trace,
        );
        setError(true);
        setLoading(false);
      }
    };

    run();
  }, [sendErrorNotification, setPrices, updateStatus]);

  const setOption = useCallback(
    (option: number, nextPurchaseText: string) => {
      if (!loading && !active && !error) {
        setSelected(option);
        setPurchaseText(nextPurchaseText);
      }
    },
    [active, error, loading],
  );

  const handlePurchase = useCallback(async () => {
    setLoading(true);
    try {
      const id = getProductName(selected);
      posthog.capture("attempt_purchase_premium", {
        tier: id,
      });
      await PurchaseManager.purchase(id);
      sendHaptic("success");
      setPremium(true);
      updateStatus(await PurchaseManager.checkStatus());
      setLoading(false);
      posthog.capture("success_purchase_premium", {
        tier: id,
      });
    } catch (error) {
      console.log("error purchasing premium:", error);
      const trace = error instanceof Error ? error.message : String(error);
      posthog.capture("error_purchase_premium", {
        error: trace,
        cancelled: trace.includes("cancelled"),
      });
      if (!trace.includes("cancelled")) {
        sendErrorNotification(
          "Premium Error",
          "We ran into an issue trying to complete your purchase, please try again later",
          "Unable to complete purchase",
          trace,
        );
      }
      setLoading(false);
    }
  }, [selected, sendErrorNotification, sendHaptic, setPremium, updateStatus]);

  const handleRestore = useCallback(async () => {
    setLoading(true);
    try {
      const result = await PurchaseManager.restorePurchases();
      if (result) {
        setPremium(true);
        setActive(true);

        const selectedTier = getSelectedTierFromProduct(result.name);
        if (selectedTier !== undefined) {
          setSelected(selectedTier);
        }

        sendHaptic("success");
        Alert.alert("Success", getRestoreMessage(result.name), [
          { text: "Ok" },
        ]);
      }
    } catch (error) {
      console.log(error);
      sendHaptic("error");
      Alert.alert("ERROR", "Could not restore purchases", [
        {
          text: "Ok",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [sendHaptic, setPremium]);

  return {
    active,
    end,
    error,
    handlePurchase,
    handleRestore,
    lifetimeCost,
    loading,
    monthlyCost,
    monthlyText,
    purchaseText,
    renew,
    selected,
    setOption,
    yearlyCost,
    yearlyText,
  };
}
