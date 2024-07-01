class ApiDataAnalysis {

    /**
     * Extracts the profile pics of a linkedin user
     */
    static async extractPathToProfilePics(linkedinLinks) {
        const pathsToProfileImage = [];
        linkedinLinks.forEach(link => {
            const parts = link.split('/');
            const profileIdentifier = parts[parts.length-2];
            const pathToProfileImage = `/Images/${profileIdentifier}.png`;
            pathsToProfileImage.push(pathToProfileImage);
        });
        return pathsToProfileImage;
    }
    
}

export default ApiDataAnalysis