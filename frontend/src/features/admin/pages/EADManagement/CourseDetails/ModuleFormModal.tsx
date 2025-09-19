import { Modal, Button, Form as AntdForm, Input } from 'antd';
import { Form, Field } from 'react-final-form';
import { Module } from '@/@types/ead';

interface ModuleFormModalProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  initialValues: Module | null;
}

const ModuleFormModal = ({ open, onCancel, onFinish, initialValues }: ModuleFormModalProps) => {
  return (
    <Modal
      title={initialValues ? 'Edit Module' : 'New Module'}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        onSubmit={onFinish}
        initialValues={initialValues || {}}
        render={({ handleSubmit, form }) => (
          <form
            onSubmit={async (event) => {
              await handleSubmit(event);
              form.reset();
            }}
          >
            <Field name="name" validate={value => (value ? undefined : 'Name is required')}>
              {({ input, meta }) => (
                <AntdForm.Item
                  label="Module Name"
                  required
                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                  help={meta.touched && meta.error}
                >
                  <Input {...input} />
                </AntdForm.Item>
              )}
            </Field>
            <div style={{ textAlign: 'right' }}>
              <Button onClick={onCancel} style={{ marginRight: 8 }}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save</Button>
            </div>
          </form>
        )}
      />
    </Modal>
  );
};

export default ModuleFormModal;
