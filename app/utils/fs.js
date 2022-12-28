import path from 'path';
import fs from 'fs/promises';
import { constants } from 'fs';

const run = async fun => {
  try {
    const res = await fun();
    if(res === undefined) return true;
    return res;
  } catch(err) {
    return false;
  }
};

export const isExists = targetPath => run(() => fs.access(targetPath, constants.R_OK | constants.W_OK));

export const removeFile = targetPath => run(() => fs.unlink(targetPath));

export const copyFile = (pathFrom, pathTo) => run(() => fs.copyFile(pathFrom, pathTo));

export const readDir = directory => run(() => fs.readdir(directory));

export const readFile = (directory, encoding) => run(() => fs.readFile(directory, encoding || 'utf8'));

export const writeFile = (file, data, encoding) => run(() => fs.writeFile(file, data, encoding || 'utf8'));

export const appendFile = (file, data) => run(() => fs.appendFile(file, data));

export const rename = (oldPath, newPath) => run(() => fs.rename(oldPath, newPath));

export const createIfNotExists = directory => run(async () => {
  const isDirExists = await isExists(directory);
  if(isDirExists) { return isDirExists; }
  const isCreated = await run(() => fs.mkdir(directory, { recursive: true }));
  return isCreated;
});

export const nameIsAvailable = name => !(/(\0)|(\/)/g.test(name));

export const getAvailableFilename = name => name.replace(/(\0)|(\/)/g, '');

export const isFile = name => run(async () => (await fs.stat(name)).isFile());
export const isDirectory = name => run(async () => (await fs.stat(name)).isDirectory());


export const getFolders =  async (targetPath) => {
  try {
    const filesAndFolders = await readDir(targetPath);
    const folders = [];
    for (const idx in filesAndFolders) {
      const name = filesAndFolders[idx]
      if( await isDirectory(path.join(targetPath, name)) ) {
        folders.push(name);
      }
    }
    return folders;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export const getFiles = async (targetPath) => {
  try {
    const filesAndFolders = await readDir(targetPath);
    const files = [];
    for (const idx in filesAndFolders) {
      const name = filesAndFolders[idx];
      if( await isFile(path.join(targetPath, name)) ) {
        files.push(name);
      }
    }
    return files;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export const removeFolder = async (path) => {
  if(await isExists(path)) {
    const files = await readDir(path);
    for (const file of files) {
      const curPath = `${path}/${file}`;
      if(await isDirectory(curPath)) {
          await removeFolder(curPath);
      } else {
        await removeFile(curPath);
      }
    }
    return run(() => fs.rmdir(path));
  }
  return false;
}
