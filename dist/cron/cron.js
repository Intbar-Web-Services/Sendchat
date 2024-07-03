import cron from "cron";
import https from "https";
const URL = "https://sendchat.xyz";
const job = new cron.CronJob("*/14 * * * *", () => {
    https
        .get(URL, (res) => {
        if (res.statusCode === 200) {
            console.log("GET request sent successfully");
        }
        else {
            console.log("GET request failed", res.statusCode);
        }
    })
        .on("error", (e) => {
        console.error("Error while sending request", e);
    });
});
export default job;
// CRON JOB EXPLANATION:
// Cron jobs are scheduled tasks that run periodically at fixed intervals or specific times
// send 1 GET request for every 14 minutes
// Schedule:
// You define a schedule using a cron expression, which consists of five fields representing:
//! MINUTE, HOUR, DAY OF THE MONTH, MONTH, DAY OF THE WEEK
//? EXAMPLES && EXPLANATION:
//* 14 * * * * - Every 14 minutes
//* 0 0 * * 0 - At midnight on every Sunday
//* 30 3 15 * * - At 3:30 AM, on the 15th of every month
//* 0 0 1 1 * - At midnight, on January 1st
//* 0 * * * * - Every hour
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2JhY2tlbmQvY3Jvbi9jcm9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUN4QixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFFMUIsTUFBTSxHQUFHLEdBQUcsc0JBQXNCLENBQUM7QUFFbkMsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7SUFDakQsS0FBSztTQUNILEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUNqQixJQUFJLEdBQUcsQ0FBQyxVQUFVLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQzlDLENBQUM7YUFBTSxDQUFDO1lBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbkQsQ0FBQztJQUNGLENBQUMsQ0FBQztTQUNELEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLDZCQUE2QixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pELENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxlQUFlLEdBQUcsQ0FBQztBQUVuQix3QkFBd0I7QUFDeEIsMkZBQTJGO0FBQzNGLDBDQUEwQztBQUUxQyxZQUFZO0FBQ1osNkZBQTZGO0FBRTdGLDBEQUEwRDtBQUUxRCw0QkFBNEI7QUFDNUIsaUNBQWlDO0FBQ2pDLDJDQUEyQztBQUMzQyx3REFBd0Q7QUFDeEQsMkNBQTJDO0FBQzNDLDBCQUEwQiJ9