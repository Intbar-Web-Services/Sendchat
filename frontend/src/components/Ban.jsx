import { Text, Button } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";

const Ban = ({ user, reason, hours }) => {
    const logout = useLogout();

    return (
        <>
            <Text>Your Sendchat account, {user.name}, has been terminated.</Text>
            <Text>{reason ?? "No reason was given"}</Text>
            <Button onClick={() => logout()}>Log out</Button>
        </>
    );
};

export default Ban;