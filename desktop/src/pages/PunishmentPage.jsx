import Warn from "../components/Warn";
import Suspend from "../components/Suspend";
import Ban from "../components/Ban";

const PunishmentPage = ({ user, type, reason, hours }) => {
    switch (type) {
        case ("warn"): {
            return <Warn user={user} reason={reason} />
        }
        case ("suspend"): {
            return <Suspend user={user} reason={reason} hours={hours} />
        }
        case ("ban"): {
            return <Ban user={user} reason={reason} hours={hours} />
        }
    }
};

export default PunishmentPage;