import fs from 'fs'
import { addSetItem } from '../utils/arrayUtils'
import { createDivider, parseWorkspaces, uppercaseFirstChar, globRel } from './helpers/scriptUtils'

/* --- Types ----------------------------------------------------------------------------------- */

type DriverConfig = {
    driverImportLines: string[],
    driverEntryLines: string[],
    driverConfigTypeLines: string[],
    drivers: {
        [driverType: string]: {
            driverType: string,
            driverTypeKey: string,
            driverTypeExportKey: string,
            driverTypeEntryLines: string[],
            driverConfigTypeEnumLines: string[],
        }
    }
}

/** --- createDriverTypeEntries() -------------------------------------------------------------- */
/** -i- Creates the driver type entry content for a given driverType */
const createDriverTypeEntries = (ctx: {
    driverType: string,
    driverConfigTypeEnumLines: string[],
}) => [

    `    ${ctx.driverType}: {`,
            ctx.driverConfigTypeEnumLines.join('\n'), // prettier-ignore
    `    }`,

].join('\n')

/** --- createDriverConfigContent() ------------------------------------------------------------ */
/** -i- Creates the file content for the driver config file */
const createDriverConfigContent = (ctx: {
    driverTypeEntries: string,
    driverTypes: string,
}) => [

    `// -i- Auto generated with "npx turbo run @green-stack/core#collect-drivers"\n`,

    `${createDivider('Constants')}\n`,

    `export const DRIVER_OPTIONS = {`,
        ctx.driverTypeEntries,
    `} as const\n`,

    `${createDivider('Types')}\n`,

    `export type DRIVER_CONFIG = {`,
        ctx.driverTypes,
    `}\n`,

    `export type DRIVER_KEYS = keyof typeof DRIVER_OPTIONS\n`,

    `${createDivider('Helpers')}\n`,

    `export const createDriverConfig = <D extends DRIVER_CONFIG>(config: D) => config\n`,

].join('\n')


/** --- createDriverTypeExportsSection() ------------------------------------------------------- */
/** -i- Creates the section in a file for the driver type exports */
const createDriverTypeExportsSection = (ctx: {
    driverType: string,
    driverTypeExport: string,
    driverTypeEntryLines: string[],
}) => [

    `${createDivider(ctx.driverType)}\n`,

    `export const ${ctx.driverTypeExport} = {`,
        ctx.driverTypeEntryLines.join('\n'), // prettier-ignore
    `}`,

].join('\n')

/** --- createDriversFileContent() ------------------------------------------------------------- */
/** -i- Creates the file content for the drivers file */
const createDriversFileContent = (ctx: {
    driverImports: string,
    driverTypeExports: string,
    driverEntryLines: string,
}) => [

    `// -i- Auto generated with "npx turbo run @green-stack/core#collect-drivers"`,
    `${ctx.driverImports}\n`,

    `${ctx.driverTypeExports}\n`,

    `${createDivider('All Drivers')}\n`,

    `export const drivers = {`,
        ctx.driverEntryLines,
    `}\n`,

].join('\n')

/* --- collect-drivers ------------------------------------------------------------------------- */

const collectDrivers = () => {
    try {
        // Get all driver file paths in /features/ & /packages/ workspaces
        const featureDriverPaths = globRel('../../features/**/drivers/*.*.ts')
        const packageDriverPaths = globRel('../../packages/**/drivers/*.*.ts')
        const allDriverPaths = [...featureDriverPaths, ...packageDriverPaths]

        // Figure out import paths from each workspace
        const { workspaceImports } = parseWorkspaces()

        // Build overview of lines to build driver registry files with
        const driverConfig = allDriverPaths.reduce((acc, driverFilePath) => {

            // Skip if not a valid driver
            const driverFileContents = fs.readFileSync(driverFilePath, 'utf-8')
            const isValidDriver = driverFileContents.includes('export const driver = validateDriver(')
            if (!isValidDriver) return acc

            // Figure out workspace info
            const workspaceEntry = Object.entries(workspaceImports).find(([pathKey]) => {
                return driverFilePath.includes(pathKey)
            })

            // Figure out driver type & name from filename
            const [workspacePath, driverWorkspace] = workspaceEntry!
            const innerDriverFilePath = driverFilePath.split(workspacePath)[1]
            const driverFilename = innerDriverFilePath.replace('/drivers/', '')
            const driverFileModuleName = driverFilename.replace('.tsx', '').replace('.ts', '')
            const [driverName, driverType] = driverFileModuleName.split('.') 
            const driverImportPath = `${driverWorkspace}/drivers/${driverFilename}`
            const driverKey = driverName === 'mock' ? `mock-${driverType}` : driverName
            const driverTypeKey = driverType.length <= 2 ? driverType.toUpperCase() : driverType
            const driverEnumKey = driverName === 'mock' ? `mock${driverTypeKey}` : driverName
            const driverTypeExportKey = `${driverType}Drivers`
            const driverImportAlias = `${driverName}${uppercaseFirstChar(driverType)}Driver`

            // Turn these into lines of code
            const driverImportLine = `import { driver as ${driverImportAlias} } from '${driverImportPath}'`
            const driverTypeEntryLine = `    '${driverKey}': ${driverImportAlias},`
            const driverEntryLine = `    ${driverType}: ${driverTypeExportKey},`
            const driverConfigTypeLine = `    ${driverType}: typeof DRIVER_OPTIONS['${driverType}'][keyof typeof DRIVER_OPTIONS['${driverType}']]`
            const driverConfigTypeEnumLine = `        ${driverEnumKey}: '${driverKey}',`

            // Add to the accumulator
            return {
                driverImportLines: addSetItem(acc.driverImportLines, driverImportLine),
                driverEntryLines: addSetItem(acc.driverEntryLines, driverEntryLine),
                driverConfigTypeLines: addSetItem(acc.driverConfigTypeLines, driverConfigTypeLine),
                drivers: {
                    [driverType]: {
                        driverType,
                        driverTypeKey,
                        driverTypeExportKey,
                        driverTypeEntryLines: addSetItem(
                            acc.drivers?.[driverType]?.driverTypeEntryLines,
                            driverTypeEntryLine,
                        ),
                        driverConfigTypeEnumLines: addSetItem(
                            acc.drivers?.[driverType]?.driverConfigTypeEnumLines,
                            driverConfigTypeEnumLine,
                        )
                    }
                }
            }
        }, {} as DriverConfig)

        // Build drivers.config.ts type entries
        const configTypeSections = Object.values(driverConfig.drivers).map((driverData) => {
            const { driverType, driverConfigTypeEnumLines } = driverData
            return createDriverTypeEntries({ driverType, driverConfigTypeEnumLines })
        }).join('\n')

        // Build drivers.config.ts file
        const driverTypes = driverConfig.driverConfigTypeLines.join('\n')
        const driverConfigContent = createDriverConfigContent({
            driverTypeEntries: configTypeSections,
            driverTypes,
        })
        fs.writeFileSync('../../packages/@registries/drivers.config.ts', driverConfigContent)

        // Build drivers.generated.ts subtype exports
        const driverTypeExports = Object.values(driverConfig.drivers).map((driverData) => {
            const { driverTypeKey, driverTypeExportKey, driverTypeEntryLines } = driverData
            return createDriverTypeExportsSection({
                driverType: driverTypeKey,
                driverTypeExport: driverTypeExportKey,
                driverTypeEntryLines,
            })
        }).join('\n')

        // Build drivers.generated.ts file
        const driverEntryLines = driverConfig.driverEntryLines.join('\n')
        const driverImports = driverConfig.driverImportLines.join('\n')
        const driversFileContent = createDriversFileContent({
            driverImports,
            driverTypeExports,
            driverEntryLines,
        })
        fs.writeFileSync('../../packages/@registries/drivers.generated.ts', driversFileContent)

    } catch (err) {
        console.log(err)
        console.error(err)
        process.exit(1)
    }
}

/* --- init ------------------------------------------------------------------------------------ */

collectDrivers()
