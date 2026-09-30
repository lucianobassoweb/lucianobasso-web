"""Validate project routing without inference, network or configuration mutations."""
from pathlib import Path
import json
import sys

try:
    import tomllib as toml
except ImportError:
    try:
        from pip._vendor import tomli as toml
    except ImportError:
        sys.exit('Parser TOML indisponível. Use Python 3.11+; nenhuma instalação foi feita.')

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {
    'explorer': ('gpt-6-luna', 'low'),
    'verifier': ('gpt-6-luna', 'medium'),
    'implementer': ('gpt-6.1-sol', 'medium'),
    'reviewer': ('gpt-6.1-sol', 'high'),
    'specialist': ('gpt-6-astra', 'high'),
}


def check(path):
    data = toml.loads(path.read_text())
    assert data['features']['multi_agent'] is True, 'multi_agent desabilitado'
    agents = data['agents']
    assert agents['enabled'] is True, 'agents desabilitado'
    assert agents['max_concurrent_threads_per_session'] == 2, 'Limite deve ser dois'
    assert agents['default_subagent_model'] == 'gpt-6-luna', 'Default incoerente'
    assert agents['default_subagent_reasoning_effort'] == 'medium', 'Esforço incoerente'
    for role, expected in EXPECTED.items():
        declaration = agents[role]
        assert declaration['description'].strip(), 'Papel sem descrição'
        role_path = (path.parent / declaration['config_file']).resolve()
        assert role_path.is_relative_to(ROOT), 'Papel fora do repositório'
        role_data = toml.loads(role_path.read_text())
        actual = (role_data['model'], role_data['model_reasoning_effort'])
        assert actual == expected, 'Roteamento incoerente: ' + role
        assert role_data['developer_instructions'].strip(), 'Papel sem instrução'
    return {'path': str(path), 'roles': len(EXPECTED), 'workers': 2, 'status': 'PASS'}


try:
    results = [check(ROOT / '.codex/config.toml')]
    if len(sys.argv) > 1:
        results.append(check(Path(sys.argv[1]).resolve()))
    for required in ('AGENTS.md', 'docs/ORCHESTRATION.md'):
        assert (ROOT / required).is_file(), 'Documento ausente: ' + required
    print(json.dumps({'configuration': results, 'runtime_loaded': 'not asserted'}, indent=2))
except (AssertionError, KeyError, OSError, ValueError) as error:
    sys.exit('FAIL: ' + str(error))
