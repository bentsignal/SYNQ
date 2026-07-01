type ImportControlStateInput = {
  exportDisabled: boolean;
  loading: boolean;
  pathname: string;
  showGlobalLoading: boolean;
  transferSize: number;
};

export type ImportControlState = {
  altDisabled: boolean;
  altTitle: string;
  hideMainControls: boolean;
  mainDisabled: boolean;
  mainTitle: string;
};

export function getImportControlState({
  exportDisabled,
  loading,
  pathname,
  showGlobalLoading,
  transferSize,
}: ImportControlStateInput): ImportControlState {
  const hideMainControls = ["/import/success", "/import/failure"].includes(
    pathname,
  );

  if (pathname === "/import/files") {
    return {
      altDisabled: loading,
      altTitle: "Cancel",
      hideMainControls,
      mainDisabled: exportDisabled,
      mainTitle: "Next",
    };
  }

  if (pathname === "/import/wifi") {
    return {
      altDisabled: transferSize > 0,
      altTitle: "Cancel",
      hideMainControls,
      mainDisabled: exportDisabled,
      mainTitle: "Next",
    };
  }

  if (pathname === "/import/export") {
    return {
      altDisabled: showGlobalLoading,
      altTitle: "Back",
      hideMainControls,
      mainDisabled: showGlobalLoading,
      mainTitle: "Next",
    };
  }

  if (pathname === "/import/save") {
    return {
      altDisabled: exportDisabled,
      altTitle: "Back",
      hideMainControls,
      mainDisabled: exportDisabled,
      mainTitle: "Finish",
    };
  }

  if (pathname === "/import/success") {
    return {
      altDisabled: true,
      altTitle: "Back",
      hideMainControls,
      mainDisabled: true,
      mainTitle: "Next",
    };
  }

  return {
    altDisabled: false,
    altTitle: "Cancel",
    hideMainControls,
    mainDisabled: false,
    mainTitle: "Next",
  };
}
