# The `migrations` Directory

This directory contains files that are used to manage the database schema. The
files in this directory are generated by TypeORM when you run the `yarn migrate`
command. The `yarn db:push` command is used to apply the migrations to the
database. Both of these commands are defined in the `package.json` file and they
can be run consecutively, to prepare a new migration and push it out to the
databse (`yarn migrate && yarn db:push`, which can be called with
`yarn db:prepare`).

Edit these files at your own risk! It's usually best to make changes to the
database by running `yarn migrate`, which creates the update file in this
directory.

The database contains a `migrations` table, which lists all previous migrations.
If you delete the files in this directory, you may lose your data.
