// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 is IERC165 {
    function ownerOf(uint256 tokenId) external view returns (address);
}

interface IERC1155 is IERC165 {
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

contract ProfilePictureService {
    struct ProfilePicture {
        address tokenAddress;
        uint256 tokenId;
    }

    struct ProfilePictureInfo {
        ProfilePicture profilePicture;
        bool owned;
    }

    mapping(address => ProfilePicture) public profilePictures;

    event ProfilePictureSet(address indexed walletAddress, address indexed tokenAddress, uint256 indexed tokenId);

    function setProfilePicture(address tokenAddress, uint256 tokenId) external {
        require(isTokenOwner(msg.sender, tokenAddress, tokenId), "Caller is not the owner of the NFT");

        profilePictures[msg.sender] = ProfilePicture(tokenAddress, tokenId);

        emit ProfilePictureSet(msg.sender, tokenAddress, tokenId);
    }

    function getProfilePicture(address walletAddress) external view returns (ProfilePicture memory) {
        return profilePictures[walletAddress];
    }

    function getProfilePictureInfo(address walletAddress) external view returns (ProfilePictureInfo memory) {
        ProfilePicture memory profilePicture = profilePictures[walletAddress];

        bool owned = isTokenOwner(walletAddress, profilePicture.tokenAddress, profilePicture.tokenId);

        return ProfilePictureInfo(profilePicture, owned);
    }

    function isTokenOwner(address walletAddress, address tokenAddress, uint256 tokenId) internal view returns (bool) {
        if (tokenAddress == address(0)) {
            return true;
        } else if (IERC165(tokenAddress).supportsInterface(0x80ac58cd)) {
            try IERC721(tokenAddress).ownerOf(tokenId) returns (address owner) {
                return owner == walletAddress;
            } catch {
                return false;
            }
        } else if (IERC165(tokenAddress).supportsInterface(0xd9b67a26)) {
            return IERC1155(tokenAddress).balanceOf(walletAddress, tokenId) > 0;
        } else {
            revert("Unsupported token type");
        }
    }
}
