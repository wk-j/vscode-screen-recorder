#addin "nuget:?package=Cake.SquareLogo"

Task("Publish").Does(() => {
    StartProcess("vsce", new ProcessSettings {
        Arguments = "publish"
    });
});

Task("Icon").Does(() =>{
    CreateLogo("((R))", "images/icon.png", new LogoSettings {
        Background = "Green",
        Foreground = "White",
        Padding = 30
    });
});

Task("Build-Swift").Does(() => {
    var settings = new ProcessSettings {
        Arguments ="build -C swift/ActiveWindow"
    };
    StartProcess("swift", settings);
});

Task("Run-Swift")
    .IsDependentOn("Build-Swift")
    .Does(() => {
        var settings = new ProcessSettings {
            Arguments =""
        };
        StartProcess("swift/ActiveWindow/.build/debug/ActiveWindow", settings);
});

var target = Argument("target", "default");
RunTarget(target);