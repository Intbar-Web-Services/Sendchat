import { SetStateAction, useState } from "react";
import useShowToast from "./useShowToast";

const usePreviewImg = () => {
	const [imgUrl, setImgUrl] = useState<string | null>(null);
	const showToast = useShowToast();
	const handleImageChange = (e: any & { target: { files: Array<Blob & { type: string }> } }) => {
		const file = e.target?.files[0];
		if (file && file.type.startsWith("image/")) {
			const reader = new FileReader();

			reader.onloadend = () => {
				setImgUrl(reader.result as string | null);
			};

			reader.readAsDataURL(file);
		} else {
			showToast("Invalid file type", " Please select an image file", "error");
			setImgUrl(null);
		}
	};
	return { handleImageChange, imgUrl, setImgUrl };
};

export default usePreviewImg;
