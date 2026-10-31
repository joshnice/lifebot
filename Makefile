.PHONY: help check
.DEFAULT_GOAL := help

help:
	@printf '%s\n' 'Lifebot' '' '  make check  Check tracked and new project files for whitespace errors'

check:
	@git diff --check
	@git diff --cached --check
	@git ls-files --others --exclude-standard -z | xargs -0 -r -I{} sh -c 'git diff --no-index --check -- /dev/null "$$1"; result=$$?; [ "$$result" -le 1 ]' sh '{}'
	@printf '%s\n' 'Project whitespace checks passed.'
