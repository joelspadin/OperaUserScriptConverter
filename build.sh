
name="UserScriptConverter"

inc="./config.xml"
inc="$inc ./*.html"
inc="$inc `find -wholename "./css/*.css"`"
inc="$inc `find -wholename "./img/*.gif"`"
inc="$inc `find -wholename "./img/*.jpg"`"
inc="$inc `find -wholename "./img/*.png"`"
inc="$inc `find -wholename "./includes/*.js"`"
inc="$inc `find -wholename "./js/*"`"
inc="$inc `find -wholename "./package/*"`"

rm -f $name.oex
zip -r $name.zip $inc

mv $name.zip $name.oex
