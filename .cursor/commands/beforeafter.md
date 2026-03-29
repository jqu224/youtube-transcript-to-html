I am submitting a pr, please generate before and after short summary in md, < 40 words 

Here is an example of the output 

```Markdown
## Before: 
- .cursor/skills/ had no index
- git tracked individual skill files
- no LLM-directed manifest existed

## After: 
- Skills folder ignored by git except AGENT_SKILLS.md 
- added AGENT_SKILLS.md — a directive manifest telling LLMs which skills are installed and when to invoke each.
```