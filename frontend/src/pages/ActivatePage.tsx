import { FormEvent, SetStateAction, useEffect, useState } from "react";
import { Input, FormControl, FormLabel, Button } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { useNavigate, useSearchParams } from "react-router-dom";
import getCurrentUserId from "../user";
import UserType from "../contracts/user";

const ActivatePage = () => {
    const [code, setCode] = useState("");
    const [updating, setUpdating] = useState(false);
    const showToast = useShowToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const paramsCode = searchParams.get("code")

    const setUser = useSetRecoilState(userAtom);
    const navigate = useNavigate();
    const handleSubmit = async (e: FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        let key;

        if (code.includes("/")) {
            key = encodeURIComponent(code);
            console.log(key);
        } else {
            key = code;
        }

        if (updating) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/punishments/activate/${key}`, {
                headers: {
                    "authorization": `Bearer ${await getCurrentUserId()}`,
                }
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            localStorage.setItem("user-threads", JSON.stringify(data));
            setUser(JSON.parse(localStorage.getItem("user-threads") as string));
            showToast("Success", "Activation was successful, you are now an admin!", "success");
            navigate(`/`);
        } catch (error: any) {
            showToast("Error", error, "error");
        } finally {
            setUpdating(false);
        }
    };

    const checkForParamCode = async () => {
        if (updating) return;
        setUpdating(true);
        setCode(paramsCode as SetStateAction<string>);
        try {
            const res = await fetch(`/api/punishments/activate/${paramsCode}`, {
                headers: {
                    "authorization": `Bearer ${await getCurrentUserId()}`,
                }
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            localStorage.setItem("user-threads", JSON.stringify(data));
            setUser(JSON.parse(localStorage.getItem("user-threads") as string) as UserType);
            showToast("Success", "Activation was successful, you are now an admin!", "success");
            navigate(`/`);
        } catch (error: any) {
            showToast("Error", error, "error");
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        if (paramsCode) {
            checkForParamCode();
        }
    }, []);
    return (
        <>
            <form onSubmit={handleSubmit}>
                <FormControl>
                    <FormLabel>Admin Code</FormLabel>
                    <Input
                        placeholder='Your Admin Code'
                        onChange={(e) => { setCode(e.target.value); }}
                        value={code}
                        _placeholder={{ color: "gray.500" }}
                        type='text'
                        maxLength={500}
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
