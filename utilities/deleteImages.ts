import { S3Client, DeleteObjectsCommand } from "@aws-sdk/client-s3"; // ES Modules import

const deleteImages = async (imgsUrl: string[]) => {
  const keys = imgsUrl.map((url) =>
    url.replace(`https://${process.env.AWS_BUCKET}.s3.amazonaws.com/`, ""),
  );

  const config = {
    region: process.env.AWS_REGION as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  };

  try {
    const aws_client = new S3Client(config);
    const input = {
      Bucket: process.env.AWS_BUCKET as string,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    };
    await aws_client.send(new DeleteObjectsCommand(input));
  } catch (err) {
    if (err instanceof Error) throw err;
  }
};

export default deleteImages;
