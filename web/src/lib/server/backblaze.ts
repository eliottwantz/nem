import {
	BACKBLAZE_BUCKET_NAME,
	BACKBLAZE_S3_ACCESS_KEY_ID,
	BACKBLAZE_S3_ENDPOINT,
	BACKBLAZE_S3_REGION,
	BACKBLAZE_S3_SECRECT_APPLICATION_KEY
} from '$env/static/private'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const s3 = new S3Client({
	endpoint: `https://${BACKBLAZE_S3_ENDPOINT}`,
	region: BACKBLAZE_S3_REGION,
	credentials: {
		accessKeyId: BACKBLAZE_S3_ACCESS_KEY_ID,
		secretAccessKey: BACKBLAZE_S3_SECRECT_APPLICATION_KEY
	}
})

export async function uploadAvatar(avatar: File, filePath: string) {
	try {
		await s3.send(
			new PutObjectCommand({
				Bucket: BACKBLAZE_BUCKET_NAME,
				Key: filePath,
				Body: Buffer.from(await avatar.arrayBuffer())
			})
		)

		console.log('Successfully uploaded data to ' + BACKBLAZE_BUCKET_NAME + '/' + filePath)
		return `https://${BACKBLAZE_BUCKET_NAME}.${BACKBLAZE_S3_ENDPOINT}/${filePath}`
	} catch (err) {
		console.log('Error: ', err)
	}
}

export async function deleteAvatar(avatarFilePath: string) {
	try {
		await s3.send(
			new DeleteObjectCommand({
				Bucket: BACKBLAZE_BUCKET_NAME,
				Key: avatarFilePath
			})
		)

		console.log('Successfully deleted avatar ' + avatarFilePath)
	} catch (err) {
		console.log('Error deleting avatar: ', err)
	}
}
