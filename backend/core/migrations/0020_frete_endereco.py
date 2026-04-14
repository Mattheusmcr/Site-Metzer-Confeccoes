"""
Migration 0020: adds address + frete fields to Pedido and PedidoPersonalizado
Safe: uses RunPython with try/except so it never fails if columns already exist.
"""
from django.db import migrations, models


def add_columns_safe(apps, schema_editor):
    db = schema_editor.connection
    with db.cursor() as cursor:
        try:
            cursor.execute(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name = 'core_pedidopersonalizado';"
            )
            pers_cols = {r[0] for r in cursor.fetchall()}

            cursor.execute(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name = 'core_pedido';"
            )
            ped_cols = {r[0] for r in cursor.fetchall()}
        except Exception:
            return

        for col, defn in [
            ('frete_tipo',  "VARCHAR(50) NOT NULL DEFAULT 'retirada'"),
            ('frete_valor', "NUMERIC(8,2) NOT NULL DEFAULT 0"),
        ]:
            if col not in ped_cols:
                try:
                    cursor.execute(f"ALTER TABLE core_pedido ADD COLUMN {col} {defn};")
                    print(f"  ✅ core_pedido.{col} added")
                except Exception as e:
                    print(f"  ⚠️  core_pedido.{col} skip: {e}")

        for col, defn in [
            ('cep',         "VARCHAR(9) NOT NULL DEFAULT ''"),
            ('rua',         "VARCHAR(200) NOT NULL DEFAULT ''"),
            ('numero',      "VARCHAR(20) NOT NULL DEFAULT ''"),
            ('complemento', "VARCHAR(100) NOT NULL DEFAULT ''"),
            ('bairro',      "VARCHAR(100) NOT NULL DEFAULT ''"),
            ('cidade',      "VARCHAR(100) NOT NULL DEFAULT ''"),
            ('estado',      "VARCHAR(2) NOT NULL DEFAULT ''"),
            ('frete_tipo',  "VARCHAR(50) NOT NULL DEFAULT 'retirada'"),
            ('frete_valor', "NUMERIC(8,2) NOT NULL DEFAULT 0"),
        ]:
            if col not in pers_cols:
                try:
                    cursor.execute(
                        f"ALTER TABLE core_pedidopersonalizado ADD COLUMN {col} {defn};"
                    )
                    print(f"  ✅ core_pedidopersonalizado.{col} added")
                except Exception as e:
                    print(f"  ⚠️  core_pedidopersonalizado.{col} skip: {e}")


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0019_pedido_status'),
    ]

    operations = [
        migrations.RunPython(add_columns_safe, migrations.RunPython.noop),
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(model_name='pedido', name='frete_tipo',
                    field=models.CharField(blank=True, default='retirada', max_length=50)),
                migrations.AddField(model_name='pedido', name='frete_valor',
                    field=models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                migrations.AddField(model_name='pedidopersonalizado', name='cep',
                    field=models.CharField(blank=True, default='', max_length=9)),
                migrations.AddField(model_name='pedidopersonalizado', name='rua',
                    field=models.CharField(blank=True, default='', max_length=200)),
                migrations.AddField(model_name='pedidopersonalizado', name='numero',
                    field=models.CharField(blank=True, default='', max_length=20)),
                migrations.AddField(model_name='pedidopersonalizado', name='complemento',
                    field=models.CharField(blank=True, default='', max_length=100)),
                migrations.AddField(model_name='pedidopersonalizado', name='bairro',
                    field=models.CharField(blank=True, default='', max_length=100)),
                migrations.AddField(model_name='pedidopersonalizado', name='cidade',
                    field=models.CharField(blank=True, default='', max_length=100)),
                migrations.AddField(model_name='pedidopersonalizado', name='estado',
                    field=models.CharField(blank=True, default='', max_length=2)),
                migrations.AddField(model_name='pedidopersonalizado', name='frete_tipo',
                    field=models.CharField(blank=True, default='retirada', max_length=50)),
                migrations.AddField(model_name='pedidopersonalizado', name='frete_valor',
                    field=models.DecimalField(decimal_places=2, default=0, max_digits=8)),
            ],
            database_operations=[],
        ),
    ]