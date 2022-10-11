[![build-test](https://github.com/duskmoon314/action-delete-ghcr-untagged/actions/workflows/test.yml/badge.svg)](https://github.com/duskmoon314/action-delete-ghcr-untagged/actions/workflows/test.yml)

# Action Delete GHCR Untagged

This action deletes all untagged versions that have exceeded the expiration date from GitHub Container Registry.

## Usage

```yaml
steps:
  - uses: duskmoon314/action-delete-ghcr-untagged@v1
    with:
      # Personal access token with `delete:packages` scope.
      # Required.
      token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}

      # Owner type of the package. Can be `user` or `org`.
      # Default: `user`
      owner_type: user

      # Owner of the package. Can be a username or an organization name.
      # Default: `github.repository_owner`
      owner: ${{ github.repository_owner }}

      # Name of the package.
      # Required.
      package_name: my-package

      # Expiration date of the untagged versions.
      # Default: `30` (days)
      expiration: 30
```

You can find a real-world example in [duskmoon314/LoD-frontend](https://github.com/duskmoon314/LoD-frontend/blob/main/.github/workflows/docker.yaml#L45-L53)

## Known Limitations

GitHub's API has a rate limit and I currently use a very simple `Promise.all(versions.map()`)` to aggressively delete all untagged versions. If you have a lot of untagged versions, the action will fail with the following error:

```text
Error: You have exceeded a secondary rate limit. Please wait a few minutes before you try again.
```
