/* eslint-disable import/no-anonymous-default-export */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import type { PlopTypes } from '@turbo/gen';
import {
  a,
  createPrompts,
  parseWorkspaces,
} from '../scripts/helpers/scriptUtils';

/* --- Disclaimer ------------------------------------------------------------------------------ */

// -i- Learn more about Turborepo Generators at:
// -i- https://turbo.build/repo/docs/core-concepts/monorepos/code-generation

/* --- Usage ----------------------------------------------------------------------------------- */

// -i- npm run add:dependencies -- --args <workspacePkg> <dependencies>
// -i- npx turbo gen dependencies --args <workspacePkg> <dependencies>

/* --- Constants ------------------------------------------------------------------------------- */

const { workspacePackages } = parseWorkspaces('./', true);

/* --- Prompts --------------------------------------------------------------------------------- */

export const gen = createPrompts(
  {
    workspacePkg: {
      type: 'autocomplete',
      message: 'Where would you like to install these dependencies?', // @ts-ignore
      choices: workspacePackages,
    },
    dependencies: {
      type: 'input',
      message: `Which dependencies should we install the Expo SDK compatible versions for? ${a.muted('(separated by spaces)')}`,
    },
  },
  {
    compute: {
      dependencies: {
        validate: (value) => !!value,
      },
    },

    parser: (answers) => {
      // Args
      const { workspacePkg } = answers!;

      // -- Vars --

      const dependencies = answers?.dependencies.split(' ');
      const depList = dependencies.join(' ');

      // -- Return --

      return {
        workspacePkg,
        dependencies,
        depList,
      };
    },
  }
);

/* --- Types ----------------------------------------------------------------------------------- */

type Answers = typeof gen._values;
type Context = typeof gen._parsed;

/** --- Dependency Installer ------------------------------------------------------------------- */
/** -i- Install Expo SDK compatible dependencies in a workspace */
export const registerDependencyGenerator = (plop: PlopTypes.NodePlopAPI) => {
  plop.setGenerator('add-dependencies', {
    description: 'Install Expo SDK compatible dependencies in a workspace',
    prompts: gen.prompts,
    actions: (data: GenAnswers) => {
      // Args
      const ctx = gen.parseAnswers(data);

      // Read the @app/expo package json
      const originalExpoPackageJsonFile = fs.readFileSync(
        'apps/expo/package.json',
        'utf-8'
      );
      const originalExpoPackageJson = JSON.parse(originalExpoPackageJsonFile); // prettier-ignore
      const originalDeps = originalExpoPackageJson.dependencies;

      // Install the new dependencies in @app/expo
      const output = execSync(
        `npm -w @app/expo run add-dependencies ${ctx.depList}`
      ); // prettier-ignore
      const _loggableOutput = output
        .toString()
        .split('\n')
        .slice(0, 9)
        .join('\n');

      // Extract the new dependencies from the package json
      const newExpoPackageJson = JSON.parse(
        fs.readFileSync('apps/expo/package.json', 'utf-8')
      ); // prettier-ignore
      const newDeps = Object.entries<string>(
        newExpoPackageJson.dependencies
      ).filter(([pkg]) => !originalDeps[pkg]); // prettier-ignore

      // Restore the old package json
      fs.writeFileSync('apps/expo/package.json', originalExpoPackageJsonFile);

      // Add the new dependencies to the chosen workspace
      const installStatements = newDeps
        .map(([pkg, v]) => `${pkg}@${v}`)
        .join(' ');
      execSync(
        `npm -w ${ctx.workspacePkg} install ${installStatements} --force`
      );

      // Log out the dependency list
      const _lsOutput = execSync(`npm ls ${ctx.depList}`);

      // Actions
      return [];
    },
  });
};
