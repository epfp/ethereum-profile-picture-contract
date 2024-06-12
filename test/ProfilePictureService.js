const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("ProfilePictureService", function () {
    async function deployFixture() {
        const [owner, client] = await ethers.getSigners();

        const avatarService = await ethers.deployContract("AvatarService");
        const erc721Mock = await ethers.deployContract("ERC721Mock");
        const erc1155Mock = await ethers.deployContract("ERC1155Mock");

        const avatarServiceAddress = await avatarService.getAddress();
        const erc721MockAddress = await erc721Mock.getAddress();
        const erc1155MockAddress = await erc1155Mock.getAddress();

        return {
            avatarService,
            erc721Mock,
            erc1155Mock,
            owner,
            client,
            avatarServiceAddress,
            erc721MockAddress,
            erc1155MockAddress
        };
    }

    it("Should own ERC721 token", async function () {
        const {
            erc721Mock,
            client
        } = await loadFixture(deployFixture);

        await erc721Mock.mint(client.address, 1);

        const balance = await erc721Mock.balanceOf(client.address);

        expect(balance).to.equal(1);
    });

    it("Should own ERC1155 token", async function () {
        const {
            erc1155Mock,
            client
        } = await loadFixture(deployFixture);

        await erc1155Mock.mint(client.address, 1, 1);

        const balance = await erc1155Mock.balanceOf(client.address, 1);

        expect(balance).to.equal(1);
    });

    it("Should set and get avatar with ERC721 token", async function () {
        const {
            avatarService,
            erc721Mock,
            client,
            erc721MockAddress
        } = await loadFixture(deployFixture);

        await erc721Mock.mint(client.address, 1);

        await avatarService
            .connect(client)
            .setAvatar(erc721MockAddress, 1);

        const profilePictureInfo = await avatarService.getAvatarInfo(client.address);

        expect(profilePictureInfo[0].tokenAddress).to.equal(erc721MockAddress);
        expect(profilePictureInfo[0].tokenId).to.equal(1);
        expect(profilePictureInfo[1]).to.equal(true);
        expect(profilePictureInfo[2]).to.equal("testUri/1");
    });

    it("Should return owned as false when set avatar with ERC721 token is no longer owned", async function () {
        const {
            avatarService,
            erc721Mock,
            owner,
            client,
            erc721MockAddress
        } = await loadFixture(deployFixture);

        await erc721Mock.mint(client.address, 1);

        await avatarService
            .connect(client)
            .setAvatar(erc721MockAddress, 1);

        // Transfer the token out
        await erc721Mock
            .connect(client)
            .safeTransferFrom(client.address, owner.address, 1);

        const profilePictureInfo = await avatarService.getAvatarInfo(client.address);

        expect(profilePictureInfo[0].tokenAddress).to.equal(erc721MockAddress);
        expect(profilePictureInfo[0].tokenId).to.equal(1);
        expect(profilePictureInfo[1]).to.equal(false);
    });

    it("Should set and get avatar with ERC1155 token", async function () {
        const {
            avatarService,
            erc1155Mock,
            client ,
            erc1155MockAddress
        } = await loadFixture(deployFixture);

        await erc1155Mock.mint(client.address, 1, 1);

        await avatarService
            .connect(client)
            .setAvatar(erc1155MockAddress, 1);

        const profilePictureInfo = await avatarService.getAvatarInfo(client.address);

        expect(profilePictureInfo[0].tokenAddress).to.equal(erc1155MockAddress);
        expect(profilePictureInfo[0].tokenId).to.equal(1);
        expect(profilePictureInfo[1]).to.equal(true);
        expect(profilePictureInfo[2]).to.equal("testUri");
    });

    it("Should return owned as false when set avatar with ERC1155 token is no longer owned", async function () {
        const {
            avatarService,
            erc1155Mock,
            owner,
            client,
            erc1155MockAddress
        } = await loadFixture(deployFixture);

        await erc1155Mock.mint(client.address, 1, 1);

        await avatarService
            .connect(client)
            .setAvatar(erc1155Mock, 1);

        // Transfer the token out
        await erc1155Mock
            .connect(client)
            .safeTransferFrom(client.address, owner.address, 1, 1, "0x");

        const profilePictureInfo = await avatarService.getAvatarInfo(client.address);

        expect(profilePictureInfo[0].tokenAddress).to.equal(erc1155MockAddress);
        expect(profilePictureInfo[0].tokenId).to.equal(1);
        expect(profilePictureInfo[1]).to.equal(false);
    });

    it("Should set zero address as avatar", async function () {
        const {
            avatarService,
            erc1155Mock,
            client,
        } = await loadFixture(deployFixture);

        await erc1155Mock.mint(client.address, 1, 1);

        await avatarService
            .connect(client)
            .setAvatar(erc1155Mock, 1);

        await avatarService
            .connect(client)
            .setAvatar(ethers.ZeroAddress, 23);

        const profilePictureInfo = await avatarService.getAvatarInfo(client.address);

        expect(profilePictureInfo[0].tokenAddress).to.equal(ethers.ZeroAddress);
        expect(profilePictureInfo[0].tokenId).to.equal(23);
        expect(profilePictureInfo[1]).to.equal(true);
    });

    it("Should return zero address as avatar when none set", async function () {
        const {
            avatarService,
            client
        } = await loadFixture(deployFixture);

        const profilePictureInfo = await avatarService.getAvatarInfo(client.address);

        expect(profilePictureInfo[0].tokenAddress).to.equal(ethers.ZeroAddress);
        expect(profilePictureInfo[0].tokenId).to.equal(0);
        expect(profilePictureInfo[1]).to.equal(true);
    });

    it("Should revert if the ERC721 token does not exist", async function () {
        const {
            avatarService,
            client,
            erc721MockAddress
        } = await loadFixture(deployFixture);

        await expect(
            avatarService
                .connect(client)
                .setAvatar(erc721MockAddress, 1)
        ).to.be.revertedWith("Caller is not the owner of the NFT");
    });

    it("Should revert if the user is not the owner of the ERC721 token", async function () {
        const {
            avatarService,
            owner,
            client,
            erc721Mock,
            erc721MockAddress
        } = await loadFixture(deployFixture);

        // Need to mint to another address or the token (id) won't exist
        await erc721Mock.mint(owner.address, 1);

        await expect(
            avatarService
                .connect(client)
                .setAvatar(erc721MockAddress, 1)
        ).to.be.revertedWith("Caller is not the owner of the NFT");
    });

    it("Should revert if the user does not own any of the ERC1155 token", async function () {
        const {
            avatarService,
            client,
            erc1155MockAddress
        } = await loadFixture(deployFixture);

        await expect(
            avatarService
                .connect(client)
                .setAvatar(erc1155MockAddress, 1)
        ).to.be.revertedWith("Caller is not the owner of the NFT");
    });

    it("Should emit ProfilePictureSet event", async function () {
        const {
            avatarService,
            erc721Mock,
            client,
            erc721MockAddress
        } = await loadFixture(deployFixture);

        await erc721Mock.mint(client.address, 1);

        await expect(
            avatarService
                .connect(client)
                .setAvatar(erc721MockAddress, 1)
        )
            .to.emit(avatarService, 'AvatarSet')
            .withArgs(client.address, erc721MockAddress, 1);
    });

    it("Should revert if set avatar is the same as current", async function () {
        const {
            avatarService,
            client,
        } = await loadFixture(deployFixture);

        await expect(
            avatarService
                .connect(client)
                .setAvatar(ethers.ZeroAddress, 0)
        ).to.be.revertedWith("Avatar is already set");
    });
});
