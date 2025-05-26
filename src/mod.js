"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mass_ModApi_1 = require("./Mass_ModApi");
class MainLoader {
    constructor() {
        this.mod = "Mass_QBZ03";
        this.beforeLoadHbList = new Array();
        this.beforeLoadItemList = new Array();
    }
    preSptLoad(container) {
        this.logger = container.resolve("WinstonLogger");
        //this.logger.debug(`[${this.mod}] Loading... `);
        this.PreSptModLoader = container.resolve("PreSptModLoader");
        this.ThisModPath = this.PreSptModLoader.getModPath(this.mod);
        //this.logger.debug(this.ThisModPath,"yellow");
        this.FileSystem = container.resolve("FileSystem");
        //this.logger.debug(`[${this.mod}] Loaded`);
    }
    async postDBLoad(container) {
        this.logger.debug(`[${this.mod}] Delayed Loading... `);
        this.databaseServer = container.resolve("DatabaseServer");
        this.jsonUtil = container.resolve("JsonUtil");
        const MUtils_DB = this.databaseServer.getTables();
        this.MassModApi = new Mass_ModApi_1.Mass_ModApi(container);
        this.MassModApi.initMod(this.ThisModPath);
        // this.loadBaseData(container);
        const MThisModPath = this.MassModApi.ThisModPathNodes;
        var componetList = [];
        for (let x in MThisModPath) {
            if (MThisModPath[x].componet != undefined) {
                var ComponetData = await this.MassModApi.jsonRead(MThisModPath[x].componet);
                if (ComponetData._enabled) {
                    this.logger.log(`Mass_NewItems Loading componet: ${ComponetData._name}`, "cyan");
                    componetList.push(x);
                }
                else {
                    this.logger.log(`Component ${ComponetData._name} will NOT be loaded due to the configuration.`, "yellow");
                }
            }
        }
        this.loadComponetList(container, componetList);
    }
    postSptLoad(container) {
        return;
    }
    loadComponetList(container, ComponetList) {
        const BundleLoader = container.resolve("BundleLoader");
        for (let i in ComponetList) {
            var componetFilePath = `${this.ThisModPath}${ComponetList[i]}/`;
            if (this.FileSystem.exists(`${this.ThisModPath}src/scripts/${ComponetList[i]}/${ComponetList[i]}.js`)) {
                var ModJs = require(`./scripts/${ComponetList[i]}/${ComponetList[i]}`);
                var ModInst = new ModJs(container, this.MassModApi);
                ModInst.onLoadMod();
            }
            else {
                this.logger.log(`No Scripts loaded for ${ComponetList[i]}`, "magenta");
            }
            if (this.FileSystem.exists(`${this.ThisModPath}${ComponetList[i]}/bundles.json`)) {
                BundleLoader.addBundles(componetFilePath);
            }
        }
    }
}
module.exports = { mod: new MainLoader() };
