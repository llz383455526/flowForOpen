'use strict';
const path = require('path');
const shelljs = require('shelljs');
const fsp = require('fs-extra');
const simpleGit = require('simple-git/promise');
const Service = require('egg').Service;

const repoName = 'githooksSample';
const repo = 'https://github.com/llz383455526/githooksSample.git';
class MergeService extends Service {
  constructor(ctx) {
    super(ctx);
    console.log('constructor invoked');
    this.initRepo();
  }
  async initRepo() {
    const workspace = this.getWorkSpace();
    const git = simpleGit(`${workspace}`);

    const workspaceFiles = await fsp.readdir(workspace);

    if (workspaceFiles.length) {
      try {
        console.log('项目已存在，需要更新');
        await git.pull();
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
    const log = await git.log();
    console.log(log);
  }

  getWorkSpace() {
    const { ctx } = this;
    const baseDir = ctx.app.baseDir;
    const workspace = path.resolve(baseDir, 'workspace');
    return workspace;
  }
}
module.exports = MergeService;
