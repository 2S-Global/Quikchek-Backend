import dotenv from "dotenv";
dotenv.config();

function compareVersions(v1, v2) {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0; // equal
}

export const versionController = async (req, res) => {
  const latestVersion = process.env.APP_VERSION;
  const currentVersion = req.body.version;

  if (!latestVersion) {
    return res.status(500).json({ error: "Latest version not configured." });
  }

  const newVersionAvailable =
    !currentVersion || compareVersions(currentVersion, latestVersion) === -1;

  return res.status(200).json({ newVersionAvailable });
};
