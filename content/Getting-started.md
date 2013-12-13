# Installation

The easiest way to get The-M-Project is to install it via npm. Make sure you have installed [Node.js](http://nodejs.org), [Git](http://git-scm.com/) and optionally, [Ruby](http://www.ruby-lang.org) and [Compass](http://compass-style.org/) (if you plan to use Sass).

```
npm install -g generator-m
```

# Creating a new Project

Create a folder and name it after the application name and open it.

```
mkdir my-new-project && cd $_
```

Inside of the folder run the The-M-Project generator. You find detail to the generator configurtion steps [here](the-generator.html).

```
yo m
```

After all dependencies are installed, start the server.

```
grunt server
```