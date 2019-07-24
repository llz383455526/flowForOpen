'use strict';
/**
 * 发布成功后，自动合并分支
 */
const Controller = require('egg').Controller;

class MergeController extends Controller {
  async index() {
    const { ctx } = this;
    const query = ctx.query;
    console.log(query);
    await ctx.service.merge.initRepo();
    ctx.service.merge.mergeFeatureIntoMaster(query.branchName);
  }
}

module.exports = MergeController;
