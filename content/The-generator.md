
## Hello yo

Espresso, the build tool for the verison 1.x of The-M-Project was great and did a good job, but it's time to say goodbye. Say hello to ```yo m``` our new build tool which based on [Grunt](http://gruntjs.com/) and [Yeoman](http://yeoman.io/).

## 1. Run the generator
Create a folder and name it after the application name and open it.

```
mkdir my-new-project && cd $_
```

Inside of the folder run the The-M-Project generator.

```
yo m
```

## 2. Select a Template
A template defines the look and feel of a page. Every Controller can set its own template or use a existing one from other controllers. After the layout is set the Controller add its Views to the Layout. This triggers the render process of the inserted Views.

![Template](/img/generator/step-template.jpg)


### Blank
A blank/empty layout.

![Blank Layout](/img/layouts/blank.png)

### Switch Layout

Switch through different pages with over 60 transitions

![Switch Layout](/img/layouts/switch.png)

### Switch Layout (Header/Content)

Switch through different pages that have a Header and Content with over 60 transitions

![Switch Layout with Header and Content](/img/layouts/switch_header_content.png)


## 3. Work with or without Sass

It is up to you if you want to use Sass inside of your project or not. If you want to use Sass we recommend Compass.

![CSS Preprocessor](/img/generator/step-csspreprocessor.jpg)


## 4. Get dependencies

Make sure you have a internet connection - all the dependencies getting installed.

![Get dependencies](/img/generator/step-install.jpg)

