# Release instructions for Lumino

## Using `jupyter_releaser`

The recommended way to make a release is to use [`jupyter_releaser`](https://github.com/jupyter-server/jupyter_releaser#checklist-for-adoption).

Because `lumino` uses independent versions, the versioning must be
done manually as follows:

```bash
yarn
yarn run update:versions
git push origin
```

## Manual Release

To create a manual release, perform the following steps:

Check for releases since the last published version to determine appropriate
patch/minor/major version changes.
If a dependent package moves by minor/major, then that package needs to jump
minor/major as well.

```bash
git clean -dfx
yarn
yarn run update:versions
# Update the changelog with changed packages (minor or higher) and included PRs.
# Tag the release with the date, e.g. 2021.4.9
#
yarn run publish
# Push any changes to master
```
