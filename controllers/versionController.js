import dotenv from "dotenv";
dotenv.config();

export const versionController = async (req, res) => {
  const latestVersion = process.env.APP_VERSION;
  const currentVersion = req.body.version;

  const newVersionAvailable =
    !currentVersion || currentVersion !== latestVersion;

  res.status(200).json({ newVersionAvailable });
};
