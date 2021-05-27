import shutil
import os
import re

# Change these values to customise:
docs_path = "./documentation"
output_path = "./documentation/_wiki"
markup_formats = [".md", ".markdown"]
media_types = [".png", ".jpg", ".gif", ".svg"]
ignore = ["external"]  # File or folder names to ignore
ext_ignore = [".DS_Store"]  # File extensions to ignore


def in_ignore_list(path, ignore_list):
    return len(set(path.split(os.sep)) & set(ignore_list)) > 0


def build_file_ext_regex_opts(ext_list):
    return "|".join(["(\{})".format(ext) for ext in ext_list])


def file_convert_links(file):
    f = open(file, 'r')
    original_markup = f.read()
    markup_regex = re.compile(
        "(\[.+\])(\()(\S*/)?(\S+)({})\)".format(build_file_ext_regex_opts(markup_formats)))
    markup_substitution = r"\1(\4)"
    new_markup = re.sub(markup_regex, markup_substitution, original_markup)
    media_link_regex = re.compile(
        "(!\[)(.+)(\]\()(\.\/)?(.*)({})\)".format(build_file_ext_regex_opts(media_types)))
    media_link_substitution = r"[[\5\6|\2]]"
    new_markup = re.sub(media_link_regex, media_link_substitution, new_markup)
    f.close()
    return new_markup


if not os.path.exists(output_path):
    os.makedirs(output_path)

print("Exporting docs to wiki repo...")
for root, dirs, files in os.walk(docs_path):
    if os.path.commonprefix([output_path, root]) == output_path or in_ignore_list(root, ignore):
        continue
    for file in files:
        if file in ignore:
            continue
        (filename, ext) = os.path.splitext(file)
        if ext in ext_ignore:
            continue
        relative_dir = os.path.relpath(root, docs_path)
        dest_folder = os.path.join(output_path, relative_dir)
        if not os.path.exists(dest_folder):
            os.makedirs(dest_folder)
        if ext in markup_formats:
            new_markup = file_convert_links(os.path.join(root, file))
            f = open(os.path.join(dest_folder, file), 'w')
            f.write(new_markup)
            f.close()
        else:
            if not os.path.exists(dest_folder):
                os.makedirs(dest_folder)
            shutil.copy(os.path.join(root, file), dest_folder)
