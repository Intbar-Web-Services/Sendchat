import { useState } from "react";
import { Input, FormControl, FormLabel, Button } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";

const ActivatePage = (props) => {
    const [code, setCode] = useState("");
    const [updating, setUpdating] = useState(false);
    const showToast = useShowToast();
    const search = props.location.search;
    const params = new URLSearchParams(search);

    if (params.code) {
        setCode(code);
        handleSubmit();
    }
    const setUser = useSetRecoilState(userAtom);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (updating) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/punishments/activate/${code}`);
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            localStorage.setItem("user-threads", JSON.stringify(data));
            setUser(JSON.parse(localStorage.getItem("user-threads")));
            showToast("Success", "Activation was successful, you are now an admin!", "success");
            navigate(`/`);
        } catch (error) {
            showToast("Error", error, "error");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <FormControl>
                    <FormLabel>Admin Code</FormLabel>
                    <Input
                        placeholder='Your Admin Code'
                        onChange={(e) => setCode(e.target.value)}
                        _placeholder={{ color: "gray.500" }}
                        type='text'
                        maxLength={30}
                    />
                </FormControl>
                <Button
                    bg={"green.400"}
                    color={"white"}
                    w='full'
                    _hover={{
                        bg: "green.500",
                    }}
                    type='submit'
                    isLoading={updating}
                >
                    Submit
                </Button>
            </form>
        </>
    );
};

export default ActivatePage;
