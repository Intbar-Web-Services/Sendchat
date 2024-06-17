import { Text, Button } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { useNavigate } from "react-router-dom";

const Warn = ({ user, reason }) => {
    const showToast = useShowToast();
    const setUser = useSetRecoilState(userAtom);

    const unWarn = async () => {
        try {
            const res = await fetch("/api/punishments/unwarn");
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            localStorage.setItem("user-threads", JSON.stringify(data));
            setUser(data);
            location.pathname = "/";
        } catch (err) {
            showToast("Error", data.error, "error");
        }
    };

    return (
        <>
            <Text>{reason}</Text>
            <Button onClick={unWarn}>Ok</Button>
        </>
    );
};

export default Warn;