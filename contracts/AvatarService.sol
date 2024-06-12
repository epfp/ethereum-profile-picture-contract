// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

interface IERC1155 {
    function balanceOf(address account, uint256 id) external view returns (uint256);
    function uri(uint256 tokenId) external view returns (string memory);
}

contract AvatarService {
    bytes4 private constant INTERFACE_ID_ERC721 = 0x80ac58cd;
    bytes4 private constant INTERFACE_ID_ERC1155 = 0xd9b67a26;

    struct Avatar {
        address tokenAddress;
        uint256 tokenId;
    }

    struct AvatarInfo {
        Avatar avatar;
        bool owned;
        string uri;
    }

    mapping(address => Avatar) public avatars;

    event AvatarSet(address indexed walletAddress, address indexed tokenAddress, uint256 indexed tokenId);

    function setAvatar(address tokenAddress, uint256 tokenId) external {
        Avatar memory currentAvatar = avatars[msg.sender];

        require(!(currentAvatar.tokenAddress == tokenAddress && currentAvatar.tokenId == tokenId), "Avatar is already set");

        require(_isTokenOwner(msg.sender, tokenAddress, tokenId), "Caller is not the owner of the NFT");

        avatars[msg.sender] = Avatar(tokenAddress, tokenId);

        emit AvatarSet(msg.sender, tokenAddress, tokenId);
    }

    function getAvatar(address walletAddress) external view returns (Avatar memory) {
        return avatars[walletAddress];
    }

    function getAvatarInfo(address walletAddress) external view returns (AvatarInfo memory) {
        Avatar memory avatar = avatars[walletAddress];

        bool owned = _isTokenOwner(walletAddress, avatar.tokenAddress, avatar.tokenId);

        string memory uri = _getTokenUri(avatar.tokenAddress, avatar.tokenId);

        return AvatarInfo(avatar, owned, uri);
    }

    function _getTokenUri(address tokenAddress, uint256 tokenId) internal view returns (string memory) {
        if (tokenAddress == address(0)) {
            return "";
        } else if (IERC165(tokenAddress).supportsInterface(INTERFACE_ID_ERC721)) {
            return IERC721(tokenAddress).tokenURI(tokenId);
        } else if (IERC165(tokenAddress).supportsInterface(INTERFACE_ID_ERC1155)) {
            return IERC1155(tokenAddress).uri(tokenId);
        } else {
            return "";
        }
    }

    function _isTokenOwner(address walletAddress, address tokenAddress, uint256 tokenId) internal view returns (bool) {
        if (tokenAddress == address(0)) {
            return true;
        } else if (IERC165(tokenAddress).supportsInterface(INTERFACE_ID_ERC721)) {
            try IERC721(tokenAddress).ownerOf(tokenId) returns (address owner) {
                return owner == walletAddress;
            } catch {
                return false;
            }
        } else if (IERC165(tokenAddress).supportsInterface(INTERFACE_ID_ERC1155)) {
            return IERC1155(tokenAddress).balanceOf(walletAddress, tokenId) > 0;
        } else {
            revert("Unsupported token type");
        }
    }
}
