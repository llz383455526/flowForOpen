'use strict';
const path = require('path');
const fsp = require('fs-extra');
const simpleGit = require('simple-git/promise');
const Service = require('egg').Service;

const repoName = 'flowForOpen';
const repo = 'https://github.com/llz383455526/flowForOpen.git';
class MergeService extends Service {
  constructor(ctx) {
    super(ctx);
    console.log('constructor invoked');
  }
  async initRepo() {
    const workspace = this.getWorkSpace();
    const git = simpleGit(`${workspace}`);

    const workspaceFiles = await fsp.readdir(workspace);

    if (workspaceFiles.length) {
      try {
        console.log('项目已存在，更新所有分支');
        await git.pull('--all');
      } catch (error) {
        console.log(`项目${repoName}更新失败：${error}`);
      }
    } else {
      try {
        git.silent(true)
          .clone(repo, workspace);
        console.log(`项目${repoName} clone success`);
      } catch (error) {
        console.log(`项目${repoName} clone fail：${error}`);
      }

    }
  }
  async mergeFeatureIntoMaster(featureName) {
    const workspace = this.getWorkSpace();
    const git = simpleGit(`${workspace}`);

    // 参数校验
    const branchSummary = await git.branch();
    console.log(branchSummary);
    const hasFeatureBranch = branchSummary.all.some(branch => {
      return branch === featureName;
    });
    if (!hasFeatureBranch) {
      this.ctx.body = {
        code: 400,
        message: `参数不正确，不存在${featureName}分支`,
        data: {
          branchName: `${featureName}`,
          allBranchs: branchSummary.all,
        },
      };
      return;
    }

    try {
      const options = [ '--ff' ]; // fast-forward 合并
      options.push(featureName);
      await git.merge(options);
      const log = await git.log();
      const diff = await git.diff(featureName);
      console.log(diff);
      this.ctx.body = {
        code: 400,
        message: `成功合并 ${featureName} 分支到master`,
        data: {
          branchName: `${featureName}`,
          latest: log.latest,
        },
      };
    } catch (error) {
      this.ctx.body = {
        code: 400,
        message: `merge ${featureName} 分支失败:${error}`,
      };
    }
  }

  getWorkSpace() {
    const { ctx } = this;
    const baseDir = ctx.app.baseDir;
    const workspace = path.resolve(baseDir, 'workspace');
    return workspace;
  }
}
module.exports = MergeService;
