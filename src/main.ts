import * as core from '@actions/core'
import {Octokit} from '@octokit/rest'
import dayjs from 'dayjs'

const octokit = new Octokit({
  auth: core.getInput('token'),
  userAgent: 'action-delete-ghcr-untagged'
})

interface PackageVersion {
  id: number
  updated_at: string
  metadata: {
    container: {
      tags: string[]
    }
  }
}

const list_versions = async (
  package_name: string,
  expiration: number,
  owner: {username?: string; org?: string}
): Promise<PackageVersion[]> => {
  try {
    const now = dayjs()
    if (owner.username) {
      const res = await octokit.paginate(
        octokit.rest.packages.getAllPackageVersionsForPackageOwnedByUser,
        {
          username: owner.username,
          package_name,
          package_type: 'container'
        }
      )
      core.debug(JSON.stringify(res))
      return (res as PackageVersion[]).filter(
        v =>
          v.metadata.container.tags.length === 0 &&
          dayjs(v.updated_at) < now.subtract(expiration, 'day')
      )
    } else if (owner.org) {
      const res = await octokit.paginate(
        octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg,
        {
          org: owner.org,
          package_name,
          package_type: 'container'
        }
      )
      core.debug(JSON.stringify(res))
      return (res as PackageVersion[]).filter(
        v =>
          v.metadata.container.tags.length === 0 &&
          dayjs(v.updated_at) < now.subtract(expiration, 'day')
      )
    } else {
      return Promise.reject(
        new Error("Must provide either 'username' or 'org'")
      )
    }
  } catch (error) {
    core.error(JSON.stringify(error))
    return Promise.reject(error)
  }
}

const delete_versions = async (
  versions: PackageVersion[],
  package_name: string,
  owner: {username?: string; org?: string}
): Promise<void> => {
  try {
    await Promise.all(
      versions.map(async v => {
        core.debug(`Deleting version ${v.id}...`)
        if (owner.username) {
          await octokit.rest.packages.deletePackageVersionForUser({
            username: owner.username,
            package_name,
            package_type: 'container',
            package_version_id: v.id
          })
        } else if (owner.org) {
          await octokit.rest.packages.deletePackageVersionForOrg({
            org: owner.org,
            package_name,
            package_type: 'container',
            package_version_id: v.id
          })
        } else {
          Promise.reject(new Error("Must provide either 'username' or 'org'"))
        }
        core.debug(`Deleted version ${v.id}`)
      })
    )
  } catch (error) {
    return Promise.reject(error)
  }
}

async function run(): Promise<void> {
  try {
    const owner_type = core.getInput('owner_type')
    const owner = core.getInput('owner')
    const package_name = core.getInput('package_name')
    const expiration = parseInt(core.getInput('expiration'))

    core.info(`Deleting old versions of ${owner}/${package_name}...`)

    const versions = await list_versions(package_name, expiration, {
      username: owner_type === 'user' ? owner : undefined,
      org: owner_type === 'org' ? owner : undefined
    })

    core.info(`Found ${versions.length} versions to delete`)
    for (const v of versions) {
      core.info(`version ${v.id} updated at ${v.updated_at}`)
    }

    await delete_versions(versions, package_name, {
      username: owner_type === 'user' ? owner : undefined,
      org: owner_type === 'org' ? owner : undefined
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
