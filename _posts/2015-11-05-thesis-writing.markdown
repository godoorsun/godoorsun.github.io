---
layout: post
title:  "How to finish a thesis with MS Office on Mac?"
date:   2015-11-05 00:22:44 +0100
categories: blog none
---

> 随着苹果设备的普及，用Mac的人也越来越多，在Mac下用Microsoft Office写毕业论文的人也随之增加，那么在使用过程中总会存在一些令人烦恼的问题，这里简单总结了下本人在用Word 2016 for Mac 写完一篇100多页博士毕业论文后的一些经验和工具等。


* Latex公式转换至Word内：
   * 使用一个很NX的Chrome插件：[LaTex2Word-Equation]，以及[视频教程]。   
* 公式后面1(a), 1(b)如何加：
  * 主要是加入[\c参数，保持continues numbering]，修改完之后记得update field。   
* 批量添加或修改citation内容：
  * 可以修改`sources.xml`，可以从`JabRef`中选择Export to clipboard，然后选择MS Office格式，保存到sources.xml中，这样就可以直接在Word的citation master list中看到这些citation，添加到current list就可以在Word中使用了。在增量更新word citation的时候，可以在`JabRef`中选择个别entry，同样操作后，在word中导入保存的文件即可。
  * 注意事项：因为bibtex中很多使用转义字符，如使用\&表示&，使用{\”u}表示ü，那么复制到sources.xml中就需要替换这些转义字符至正常的字符，比较麻烦，可以使用全局替换去做，不过很麻烦，太多的转义字符。找了下`JabRef`的插件，也没有找到，想着自己去写个插件或者是替换转义字符的小程序什么的（有空再说把）。想到一个方法是bib文件全部使用uff-8保存，然后全部不使用转义字符，那么复制也就不会有问题了，tex文件也使用utf-8编码，pdf文件生成也会正常（已测试，加入\usepackage[utf8]{inputenc}，并保存为uff-8格式即可）。不过后来发现，从Google Scholar等地方拷贝过来的bibtex内容也是使用转义字符的，那么问题有蛋疼了，每次在bib文件中加入一些新的参考文献，又要手工修改了。总结一句话，珍爱生命，远离word。
  * 附录OS X下面的`sources.xml`目录：/Users/username/Library/Containers/com.microsoft.Word/Data/Library/Application\ Support/Microsoft/Office/Sources.xml，windows下面的sources.xml目录：C:\Users\username\AppData\Roaming\Microsoft\Bibliography
*  [Bibword]中参考文献的style格式同样可以支持word格式，如果没有自己想要的格式，可以挑一个跟自己需要的格式接近的，然后修改找到相应的样式文件，修改即可，修改的过程是trial and error。默认加进去的参考文献标号不是superscript的，而且style格式是不支持superscript的，手工修改superscript是不可能的，因此，网上找了个[批量修改标号格式的宏]，Mac下面不好使，Windows下面没问题。另外，据官网说，BibWord is not supported on Word 2016 for Mac，不过我这里用的都是蛮正常的，只是偶尔也会crash下。
* 如何格式化word章和节以及小节，并且能够相互引用：
  *  图片或者表格的caption中如果加入章节名字（如图2.1），那么这个章节必须要有heading style （真的好奇葩的规则），我们可以使用word中自带的heading style，也可以自己事先格式化好标题，然后让heading style match这个style，就可以了。后面其他的标题均用格式刷就好了。另外，为了层次化的目录，标题需要有正确的multilevel list中的level。
* 章节层次化：
  * 在使用multilevel list的时候，使用Tab键即可输入下一个子level。可以在multilevel list中自定义一个新的multilevel list。
* 插入公式技巧：
  * 插入公式对齐的情况，可以使用表格结构，标号右对齐（https://support.microsoft.com/en-us/kb/123430）


> 其他参考的：


1. 在word中也可以使用bibtex，http://www.ee.ic.ac.uk/hp/staff/dmb/perl/index.html
2. alt+F9 可以查看所有域的source field，可修改，检查，mac下的office不支持修改域代码，windows上的office可以

To be continued.

Feel free to ask any questions.

[LaTex2Word-Equation]: https://github.com/idf/LaTex2Word-Equation
[视频教程]: https://www.youtube.com/watch?v=56HWKBuM-zg
[\c参数，保持continues numbering]: http://answers.microsoft.com/en-us/office/forum/office_2003-word/how-to-use-caption-to-label-table-1a-1b-then-table/79d7624f-8390-4c60-ade0-650674425eb5
[Bibword]: https://bibword.codeplex.com/
[批量修改标号格式的宏]: https://www.youtube.com/watch?v=56HWKBuM-zg


