import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    profilePic: {
        type: String,
        default: "",
    },
    followers: {
        type: [String],
        default: [],
    },
    following: {
        type: [String],
        default: [],
    },
    bio: {
        type: String,
        default: "",
    },
    likesHidden: {
        type: Boolean,
        default: false,
    },
    firebaseId: {
        type: String,
        default: "",
    },
    subscriptions: {
        posts: {
            type: Boolean,
            default: true,
        },
        follow: {
            type: Boolean,
            default: false,
        },
    },
    punishment: {
        type: {
            type: String,
            enum: ['warn', 'suspend', 'ban', 'none'],
            default: 'none',
        },
        reason: {
            type: String,
            default: '',
        },
        hours: {
            type: Number,
            default: null,
        },
        offenses: {
            type: Number,
            default: 0,
        },
    },
    isFrozen: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const User = mongoose.model("User", userSchema);
export default User;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlck1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYmFja2VuZC9tb2RlbHMvdXNlck1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQztBQUVoQyxNQUFNLFVBQVUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQ3JDO0lBQ0MsSUFBSSxFQUFFO1FBQ0wsSUFBSSxFQUFFLE1BQU07UUFDWixRQUFRLEVBQUUsSUFBSTtLQUNkO0lBQ0QsUUFBUSxFQUFFO1FBQ1QsSUFBSSxFQUFFLE1BQU07UUFDWixRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxJQUFJO0tBQ1o7SUFDRCxLQUFLLEVBQUU7UUFDTixJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLElBQUk7S0FDWjtJQUNELFNBQVMsRUFBRTtRQUNWLElBQUksRUFBRSxPQUFPO1FBQ2IsT0FBTyxFQUFFLEtBQUs7S0FDZDtJQUNELFVBQVUsRUFBRTtRQUNYLElBQUksRUFBRSxNQUFNO1FBQ1osT0FBTyxFQUFFLEVBQUU7S0FDWDtJQUNELFNBQVMsRUFBRTtRQUNWLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUNkLE9BQU8sRUFBRSxFQUFFO0tBQ1g7SUFDRCxTQUFTLEVBQUU7UUFDVixJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDZCxPQUFPLEVBQUUsRUFBRTtLQUNYO0lBQ0QsR0FBRyxFQUFFO1FBQ0osSUFBSSxFQUFFLE1BQU07UUFDWixPQUFPLEVBQUUsRUFBRTtLQUNYO0lBQ0QsV0FBVyxFQUFFO1FBQ1osSUFBSSxFQUFFLE9BQU87UUFDYixPQUFPLEVBQUUsS0FBSztLQUNkO0lBQ0QsVUFBVSxFQUFFO1FBQ1gsSUFBSSxFQUFFLE1BQU07UUFDWixPQUFPLEVBQUUsRUFBRTtLQUNYO0lBQ0QsYUFBYSxFQUFFO1FBQ2QsS0FBSyxFQUFFO1lBQ04sSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsSUFBSTtTQUNiO1FBQ0QsTUFBTSxFQUFFO1lBQ1AsSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsS0FBSztTQUNkO0tBQ0Q7SUFDRCxVQUFVLEVBQUU7UUFDWCxJQUFJLEVBQUU7WUFDTCxJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQztZQUN4QyxPQUFPLEVBQUUsTUFBTTtTQUNmO1FBQ0QsTUFBTSxFQUFFO1lBQ1AsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsRUFBRTtTQUNYO1FBQ0QsS0FBSyxFQUFFO1lBQ04sSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsSUFBSTtTQUNiO1FBQ0QsUUFBUSxFQUFFO1lBQ1QsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsQ0FBQztTQUNWO0tBQ0Q7SUFDRCxRQUFRLEVBQUU7UUFDVCxJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRSxLQUFLO0tBQ2Q7Q0FDRCxFQUNEO0lBQ0MsVUFBVSxFQUFFLElBQUk7Q0FDaEIsQ0FDRCxDQUFDO0FBRUYsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFaEQsZUFBZSxJQUFJLENBQUMifQ==