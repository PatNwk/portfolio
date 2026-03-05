---
title: bctf2025 forensics/The Professor's Files
subtitle: "Challenge Forensics"
date: 2025-03-25T10:00:00Z
tags: ["forensics", "docx", "office", "bctf"]
featured: true
mood: "cozy"
---

![osu_ethics_report.jpg](osu_ethics_report.jpg)

We’re given an **“Ethics Report”** supposedly written by a professor.  
The PDF/Word export looks… strange: odd spacing, inconsistent paragraphs, and there’s even a rumor that this professor likes to **hide data in plain sight**.

The attachment is a file named something like:

> `OSU_Ethics_Report.docx`

Let’s treat it as a classic **Office forensics** challenge.

---

## 1. First look at the document

Before opening in Word/LibreOffice, basic triage from the terminal:

file OSU_Ethics_Report.docx
strings OSU_Ethics_Report.docx | head
Nothing obvious in strings, and file tells us it’s a normal Office Open XML document (Word 2007+).

Opening the file in a normal editor just shows a short ethics report text, formatted in a slightly clunky way — enough to make us suspicious, but nothing that screams “flag here”.

Time to look under the hood.

2. DOCX = ZIP (always, always check this)
A .docx file is just a ZIP archive with XML inside.

So we try:

unzip -l OSU_Ethics_Report.docx
We get a classic Word structure:

[Content_Types].xml

_rels/.rels

docProps/app.xml

docProps/core.xml

docProps/custom.xml

word/document.xml

word/styles.xml

word/theme/theme1.xml

etc.

Good news: this is exactly the kind of structure where people hide flags, especially in:

word/document.xml (visible text, plus sometimes hidden text/comments)

word/theme/theme1.xml (often ignored, good place for sneaky comments)

docProps/*.xml (metadata)

## 3. Metadata and “vibes check”
Let’s skim the metadata in docProps:

unzip -p OSU_Ethics_Report.docx docProps/app.xml
unzip -p OSU_Ethics_Report.docx docProps/core.xml
In app.xml, we see that the Application is something like:

<Application>LibreOffice/24.2.7.2$Linux_X86_64 ...</Application>
So this “OSU professor’s” report was last saved with LibreOffice on Linux, not with Microsoft Word on some university-managed Windows machine.
Not proof by itself, but definitely custom work rather than a generic export.

In core.xml and custom.xml, there’s basically no interesting author info or custom properties — which feels intentionally blank.

Still no flag… but we’ve confirmed the document was almost certainly hand-tweaked.

## 4. Hidden clue in the visible text: acrostic
Now we inspect the main content:

unzip -p OSU_Ethics_Report.docx word/document.xml > document.xml
That XML contains the actual text of the ethics report.
When you read it normally, it just looks like a short document with 7–8 paragraphs.

But if you extract the first letter of each paragraph, you get:

O H P X R L R F
Concatenated:

OHPXRLRF
This looks like a substitution cipher or Caesar/ROT13.
Try ROT13:


text = "OHPXRLRF"
print(''.join(
    chr((ord(c) - ord('A') + 13) % 26 + ord('A')) for c in text
))
Result:

BUCKEYES
“Buckeyes” → Ohio State → BCTF / Buckeye CTF.
This is clearly a hint that we’re on the right track and that the real flag is hidden inside the structure of the DOCX, not in the visible text.

## 5. Digging deeper in the DOCX internals
Once we’ve checked the main document, the next classic place to look is the theme file:

unzip -p OSU_Ethics_Report.docx word/theme/theme1.xml > theme1.xml
Open theme1.xml in any text editor.

Most of it is just color definitions like:

<a:accent1>...</a:accent1>
<a:accent2>...</a:accent2>
...
But buried near the end of the color list, between normal XML tags, there’s a comment:

<!-- bctf{docx_is_zip} -->
This is our flag, cleanly hidden where almost nobody looks:
inside the theme configuration of the Word document.

## 6. Short Python approach (alternative)
If you prefer to script it instead of using unzip, a few lines of Python also do the job:

from zipfile import ZipFile

docx_path = "OSU_Ethics_Report.docx"

with ZipFile(docx_path) as z:
    theme_xml = z.read("word/theme/theme1.xml").decode("utf-8")

for line in theme_xml.splitlines():
    if "bctf{" in line.lower():
        print(line.strip())
Output:

<!-- bctf{docx_is_zip} -->
Same result, with less clicking around.

7. Flag
Final flag:

bctf{docx_is_zip}

This challenge is a perfect introduction to Office forensics:

Remember that .docx = ZIP + XML

Look at metadata (docProps/)

Inspect main content (word/document.xml) for:

acrostics

weird capitalization

comments

Check secondary files (word/theme/, styles.xml, etc.) — they are great hiding spots

Next time you see a “normal” Word document in a CTF, you’ll know exactly where to poke first. 

By N3akz
