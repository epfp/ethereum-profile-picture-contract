// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
}

interface IERC1155 {
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

contract AvatarService {
    struct Avatar {
        address tokenAddress;
        uint256 tokenId;
    }

    struct AvatarInfo {
        Avatar avatar;
        bool owned;
    }

    mapping(address => Avatar) public avatars;

    event AvatarSet(address indexed walletAddress, address indexed tokenAddress, uint256 indexed tokenId);

    function setAvatar(address tokenAddress, uint256 tokenId) external {
        require(isTokenOwner(msg.sender, tokenAddress, tokenId), "Caller is not the owner of the NFT");

        avatars[msg.sender] = Avatar(tokenAddress, tokenId);

        emit AvatarSet(msg.sender, tokenAddress, tokenId);
    }

    function getAvatar(address walletAddress) external view returns (Avatar memory) {
        return avatars[walletAddress];
    }

    function getAvatarInfo(address walletAddress) external view returns (AvatarInfo memory) {
        Avatar memory avatar = avatars[walletAddress];

        bool owned = isTokenOwner(walletAddress, avatar.tokenAddress, avatar.tokenId);

        return AvatarInfo(avatar, owned);
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
