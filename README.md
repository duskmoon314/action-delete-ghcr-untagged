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
