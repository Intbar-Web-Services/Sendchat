import { useToast } from "@chakra-ui/toast";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const useShowToast = () => {
	const toast = useToast();
	const navigate = useNavigate();

	const showToast = useCallback(
		(title, description, status) => {
			if (description == "You are currently punished") {
				navigate(`/`);
			}

			toast({
				title,
				description,
				status,
				duration: 3000,
				isClosable: true,
			});
		},
		[toast]
	);

	return showToast;
};

export default useShowToast;
