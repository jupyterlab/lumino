# Release instructions for Lumino

## Using `jupyter_releaser`

The recommended way to make a release is to use [`jupyter_releaser`](https://jupyter-releaser.readthedocs.io/en/latest/get_started/making_release_from_repo.html).

Because `lumino` uses independent versions, the versioning must be
done manually as follows:

```bash
yarn
yarn run update:versions
# Update yarn.lock
yarn
git commit -a -m "Update versions"
git push origin main
```

If you forget to bump the versions and need to undo:

```bash
git revert <version-bump-commit-sha>
git push origin main
push --delete origin <version-tag>
```

Then when triggering the _Step 1: Prep Release_ action, you will need to set
the _New Version Spec_ to the current date `<YEAR>.<MONTH>.<DAY>`.
Do not include leading zeros (for example, February 1, 2029 should be `2029.2.1`).

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
# Push any changes to main
```
