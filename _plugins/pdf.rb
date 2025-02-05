


Jekyll::Hooks.register :posts, :pre_render do |post|
    # code to call after Jekyll renders a page
       
    if post.data["layout"] == "job"
        post.data["pdf"] = "/open-positions/" + post.basename_without_ext + ".pdf"
    end
end

Jekyll::Hooks.register :posts, :post_write do |post|
    # code to call after Jekyll renders a page
    if post.data["layout"] == "job"
        qrcode = post.site.config["url"] + post.url

        pdffile = post.data["pdf"]

        Jekyll.logger.debug "Generate pdf:", pdffile

        cmd = "pandoc #{post.path} --output #{File.join(post.site.config["destination"], pdffile)} --template jobposting.tex -M qrcode='#{qrcode}'"

        Dir.chdir(post.site.config["plugins_dir"]){
            %x[#{cmd}] unless File.exists?(File.join(post.site.config["destination"], pdffile))
        }
    end
end

Jekyll::Hooks.register :site, :pre_render do |site|
    Jekyll.logger.debug "Site:", site.collections["team"]
end