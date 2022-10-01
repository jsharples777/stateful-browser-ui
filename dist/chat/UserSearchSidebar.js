import { SidebarViewContainer } from '../container/SidebarViewContainer';
import { UserSearchView } from "./UserSearchView";
import { FavouriteUserView } from "./FavouriteUserView";
import { BlockedUserView } from "./BlockedUserView";
import { ChatRoomsSidebar } from "./ChatRoomsSidebar";
import { SidebarLocation } from "../ConfigurationTypes";
export class UserSearchSidebar extends SidebarViewContainer {
    constructor(stateManager) {
        super(UserSearchSidebar.SidebarPrefs);
        const recentSearches = UserSearchView.getInstance(stateManager);
        this.addView(recentSearches, { containerId: UserSearchSidebar.SidebarContainers.recentSearches });
        const favouriteUsers = FavouriteUserView.getInstance(stateManager);
        this.addView(favouriteUsers, { containerId: UserSearchSidebar.SidebarContainers.favourites });
        const blockedUsers = BlockedUserView.getInstance(stateManager);
        this.addView(blockedUsers, { containerId: UserSearchSidebar.SidebarContainers.blocked });
        this.logSB = ChatRoomsSidebar.getInstance(stateManager);
    }
    static getInstance(stateManager) {
        if (!(UserSearchSidebar._instance)) {
            UserSearchSidebar._instance = new UserSearchSidebar(stateManager);
        }
        return UserSearchSidebar._instance;
    }
}
UserSearchSidebar.SidebarPrefs = {
    id: 'userSearchSideBar',
    expandedSize: '35%',
    location: SidebarLocation.left
};
UserSearchSidebar.SidebarContainers = {
    recentSearches: 'userSearchZone',
    favourites: 'favouriteUsersDropZone',
    blocked: 'blockedUsersDropZone'
};
//# sourceMappingURL=UserSearchSidebar.js.map