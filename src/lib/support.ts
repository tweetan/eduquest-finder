const SUPPORT_EMAIL = "lina.aasberg@gmail.com";

interface SupportMailOptions {
  type: "low-quality" | "disrespectful-exchange" | "quality-flag";
  claimId?: string;
  itemTitle: string;
  description: string;
  reporterName?: string;
}

export function openSupportEmail(options: SupportMailOptions) {
  const subjectMap = {
    "low-quality": `[KidSwap] Low Quality Report — ${options.itemTitle}`,
    "disrespectful-exchange": `[KidSwap] Exchange Complaint — ${options.itemTitle}`,
    "quality-flag": `[KidSwap] Item Flagged — ${options.itemTitle}`,
  };

  const subject = encodeURIComponent(subjectMap[options.type]);

  const bodyLines = [
    `Type: ${options.type}`,
    options.claimId ? `Claim ID: ${options.claimId}` : "",
    `Item: ${options.itemTitle}`,
    options.reporterName ? `Reported by: ${options.reporterName}` : "",
    "",
    "Description:",
    options.description,
    "",
    `Sent from KidSwap on ${new Date().toLocaleDateString()}`,
  ].filter(Boolean);

  const body = encodeURIComponent(bodyLines.join("\n"));

  window.open(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`, "_self");
}
