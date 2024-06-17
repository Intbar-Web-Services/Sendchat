import Warn from "../components/Warn";

const PunishmentPage = ({ user, type, reason }) => {
    switch (type) {
        case ("warn"): {
            return <Warn user={user} reason={reason} />
        }
    }
};

export default PunishmentPage;