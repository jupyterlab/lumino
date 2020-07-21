# Release instructions for Lumino

Check for releases since the last published version to determine appropriate
patch/minor/major version changes.
If a dependent package moves by minor/major, then that package needs to jump
minor/major as well.

```bash
git clean -dfx
yarn
yarn run version
# Update the changelog with published packages (minor or higher) and included PRs.
#
yarn run publish
# Push any changes to master
```
