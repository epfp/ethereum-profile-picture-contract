const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const AvatarServiceModule = buildModule("AvatarServiceModule", (m) => {
    const token = m.contract("AvatarService");

    return { token };
});

module.exports = AvatarServiceModule;
