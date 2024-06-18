import { Text, Button } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Suspend = ({ user, reason, hours }) => {
    const showToast = useShowToast();
    const [loading, setLoading] = useState(false);
    const unsuspend = async () => {
        setLoading(true);
        const res = await fetch(`/api/punishments/unsuspend`);
        setLoading(false);
        if (res.error) return showToast("Error", res.error, "error");
        location.reload();
    };
    const time = ((hours) - (Math.floor(new Date().getTime())) / 1000) / 3600;
    if (time <= 0) {
        unsuspend();
    }

    function SplitTime(numberOfHours) {
        var days = Math.floor(numberOfHours / 24);
        var remainder = numberOfHours % 24;
        var hours = Math.floor(remainder);
        var minutes = Math.floor(60 * (remainder - hours));
        return ({ days, hours, minutes })
    }

    const { days, hours: hoursParsed, minutes } = SplitTime(time);

    return (
        <>
            <Text>You have {days} day{days > 1 ? "s" : ""} left, {hoursParsed} hour{hoursParsed > 1 ? "s" : ""} left, and {minutes} minute{minutes > 1 ? "s" : ""} left</Text>
            <Text>{reason}</Text>
            <Button isLoading={loading} onClick={() => { setLoading(true); location.reload() }}>Reload</Button>
        </>
    );
};

export default Suspend;